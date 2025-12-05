"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DefaultDeviceController,
  DefaultMeetingSession,
  ConsoleLogger,
  LogLevel,
  MeetingSessionConfiguration,
  VideoTileState,
  DataMessage,
} from "amazon-chime-sdk-js";
import { getToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

interface Attendee {
  attendeeId: string;
  name: string;
  muted: boolean;
  videoEnabled: boolean;
}

interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

export default function MeetingPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession | null>(null);
  const [currentUserName, setCurrentUserName] = useState("You");
  const [currentUserId, setCurrentUserId] = useState("me");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [attendees, setAttendees] = useState<Map<string, Attendee>>(new Map());
  const [videoTiles, setVideoTiles] = useState<Map<number, string>>(new Map());
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState("");
  const [selectedVideoInput, setSelectedVideoInput] = useState("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState("");

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const contentShareRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const setupObservers = useCallback((session: DefaultMeetingSession) => {
    session.audioVideo.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState) => {
        const videoElement = tileState.isContent ? contentShareRef.current : videoRefs.current.get(tileState.tileId!);
        if (videoElement && tileState.tileId) {
          session.audioVideo.bindVideoElement(tileState.tileId, videoElement);
        }
        if (tileState.tileId && tileState.boundAttendeeId) {
          setVideoTiles((prev) => {
            const newMap = new Map(prev);
            newMap.set(tileState.tileId!, tileState.boundAttendeeId!);
            return newMap;
          });
        }
      },
      videoTileWasRemoved: (tileId: number) => {
        setVideoTiles((prev) => {
          const newMap = new Map(prev);
          newMap.delete(tileId);
          return newMap;
        });
      },
    });

    session.audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId: string, present: boolean, externalUserId?: string) => {
      if (present) {
        setAttendees((prev) => {
          const newMap = new Map(prev);
          const username = externalUserId?.split("#")[0] || attendeeId.split("#")[0] || "Unknown";
          newMap.set(attendeeId, { attendeeId, name: username, muted: false, videoEnabled: false });
          return newMap;
        });
      } else {
        setAttendees((prev) => {
          const newMap = new Map(prev);
          newMap.delete(attendeeId);
          return newMap;
        });
      }
    });

    session.audioVideo.realtimeSubscribeToVolumeIndicator("", (attendeeId, volume, muted) => {
      setAttendees((prev) => {
        const newMap = new Map(prev);
        const attendee = newMap.get(attendeeId);
        if (attendee) {
          attendee.muted = muted || false;
          newMap.set(attendeeId, attendee);
        }
        return newMap;
      });
    });

    session.audioVideo.realtimeSubscribeToReceiveDataMessage("chat", (dataMessage: DataMessage) => {
      const data = JSON.parse(dataMessage.text()) as ChatMessage;
      setChatMessages((prev) => [...prev, data]);
    });
  }, []);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        const token = getToken();
        if (token) {
          const decoded = jwtDecode<{ name: string; nameid: string }>(token);
          setCurrentUserName(decoded.name || "You");
          setCurrentUserId(decoded.nameid || "me");
        }

        const storedInfo = sessionStorage.getItem("chimeMeetingInfo");
        if (!storedInfo) {
          toast.error("No meeting information found");
          router.push(`/user/projects/${projectId}`);
          return;
        }

        const joinInfo = JSON.parse(storedInfo);
        const meeting = joinInfo.meeting || joinInfo.Meeting;
        const attendee = joinInfo.attendee || joinInfo.Attendee;

        if (!meeting?.mediaPlacement && !meeting?.MediaPlacement) {
          throw new Error("Invalid meeting data");
        }

        const logger = new ConsoleLogger("ChimeMeeting", LogLevel.WARN);
        const deviceController = new DefaultDeviceController(logger);
        const configuration = new MeetingSessionConfiguration(meeting, attendee);
        const session = new DefaultMeetingSession(configuration, logger, deviceController);

        const audioInputs = await session.audioVideo.listAudioInputDevices();
        const videoInputs = await session.audioVideo.listVideoInputDevices();
        const audioOutputs = await session.audioVideo.listAudioOutputDevices();

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);
        setAudioOutputDevices(audioOutputs);

        const audioElement = audioElementRef.current;
        if (audioElement) {
          session.audioVideo.bindAudioElement(audioElement);
        }

        if (audioInputs.length > 0) {
          await session.audioVideo.startAudioInput(audioInputs[0].deviceId);
          setSelectedAudioInput(audioInputs[0].deviceId);
        }

        if (audioOutputs.length > 0) {
          await session.audioVideo.chooseAudioOutput(audioOutputs[0].deviceId);
          setSelectedAudioOutput(audioOutputs[0].deviceId);
        }

        setupObservers(session);
        await session.audioVideo.start();
        session.audioVideo.realtimeUnmuteLocalAudio();
        setIsAudioMuted(false);

        setMeetingSession(session);
        setIsLoading(false);
        toast.success("Connected to meeting");
      } catch (error) {
        console.error("Failed to initialize meeting:", error);
        toast.error("Failed to join meeting");
        router.push(`/user/projects/${projectId}`);
      }
    };

    initializeMeeting();

    return () => {
      if (meetingSession) {
        meetingSession.audioVideo.stopLocalVideoTile();
        try {
          meetingSession.audioVideo.stopVideoInput();
          meetingSession.audioVideo.stopContentShare();
        } catch (error) {
          console.error(error);
        }
        meetingSession.audioVideo.stop();
      }
    };
  }, [projectId, router, setupObservers]);

  const toggleAudio = () => {
    if (!meetingSession) return;
    if (isAudioMuted) {
      meetingSession.audioVideo.realtimeUnmuteLocalAudio();
      setIsAudioMuted(false);
      toast.success("Microphone on");
    } else {
      meetingSession.audioVideo.realtimeMuteLocalAudio();
      setIsAudioMuted(true);
      toast.success("Microphone off");
    }
  };

  const toggleVideo = async () => {
    if (!meetingSession) return;
    try {
      if (isVideoEnabled) {
        meetingSession.audioVideo.stopLocalVideoTile();
        await meetingSession.audioVideo.stopVideoInput();
        setIsVideoEnabled(false);
        toast.success("Camera off");
      } else {
        const device = selectedVideoInput || videoDevices[0]?.deviceId;
        if (device) {
          await meetingSession.audioVideo.startVideoInput(device);
          meetingSession.audioVideo.startLocalVideoTile();
          setIsVideoEnabled(true);
          toast.success("Camera on");
        }
      }
    } catch (error) {
      console.error("Video toggle error:", error);
      toast.error("Failed to toggle video");
    }
  };

  const toggleScreenShare = async () => {
    if (!meetingSession) return;
    try {
      if (isScreenSharing) {
        await meetingSession.audioVideo.stopContentShare();
        setIsScreenSharing(false);
        toast.success("Screen sharing stopped");
      } else {
        const observer = {
          contentShareDidStart: () => {
            setIsScreenSharing(true);
            toast.success("Screen sharing started");
          },
          contentShareDidStop: () => {
            setIsScreenSharing(false);
          },
        };
        meetingSession.audioVideo.addContentShareObserver(observer);
        await meetingSession.audioVideo.startContentShareFromScreenCapture();
      }
    } catch (error) {
      console.error("Screen share error:", error);
      toast.error("Failed to share screen");
      setIsScreenSharing(false);
    }
  };

  const sendChatMessage = () => {
    if (!meetingSession || !chatInput.trim()) return;
    const message: ChatMessage = {
      senderId: currentUserId,
      senderName: currentUserName,
      message: chatInput,
      timestamp: Date.now(),
    };
    meetingSession.audioVideo.realtimeSendDataMessage("chat", JSON.stringify(message));
    setChatMessages((prev) => [...prev, message]);
    setChatInput("");
  };

  const changeAudioInput = async (deviceId: string) => {
    if (!meetingSession) return;
    const wasMuted = isAudioMuted;
    await meetingSession.audioVideo.startAudioInput(deviceId);
    if (!wasMuted) {
      meetingSession.audioVideo.realtimeUnmuteLocalAudio();
    }
    setSelectedAudioInput(deviceId);
    toast.success("Microphone changed");
  };

  const changeVideoInput = async (deviceId: string) => {
    if (!meetingSession) return;
    setSelectedVideoInput(deviceId);
    if (isVideoEnabled) {
      await meetingSession.audioVideo.startVideoInput(deviceId);
      toast.success("Camera changed");
    }
  };

  const changeAudioOutput = async (deviceId: string) => {
    if (!meetingSession) return;
    await meetingSession.audioVideo.chooseAudioOutput(deviceId);
    setSelectedAudioOutput(deviceId);
    toast.success("Speaker changed");
  };

  const leaveMeeting = async () => {
    if (meetingSession) {
      try {
        meetingSession.audioVideo.stopLocalVideoTile();
        await meetingSession.audioVideo.stopVideoInput();
        await meetingSession.audioVideo.stopContentShare();
        meetingSession.audioVideo.stop();
      } catch (error) {
        console.error("Error leaving meeting:", error);
      }
    }
    sessionStorage.removeItem("chimeMeetingInfo");
    router.push(`/user/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#dfe1e6] border-t-[#0052cc] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#172b4d] text-lg font-medium">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f4f5f7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#dfe1e6] px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-lg font-semibold text-[#172b4d]">Meeting Room</h1>
            <span className="text-sm text-[#5e6c84]">• {attendees.size} participant{attendees.size !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={leaveMeeting} className="text-sm text-[#de350b] hover:underline font-medium">
            Leave Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className={`flex-1 p-4 ${showChat || showRoster ? 'pr-2' : ''}`}>
          <div className="h-full grid gap-3" style={{ gridTemplateColumns: videoTiles.size > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr' }}>
            {Array.from(videoTiles.entries()).map(([tileId, attendeeId]) => (
              <div key={tileId} className="relative bg-[#172b4d] rounded-lg overflow-hidden shadow-lg border border-[#dfe1e6]">
                <video
                  ref={(el) => {
                    if (el && !videoRefs.current.has(tileId)) {
                      videoRefs.current.set(tileId, el);
                      if (meetingSession) {
                        meetingSession.audioVideo.bindVideoElement(tileId, el);
                      }
                    }
                  }}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted={false}
                />
                <div className="absolute bottom-3 left-3 bg-[#172b4d] bg-opacity-90 px-3 py-1.5 rounded text-white text-sm font-medium flex items-center gap-2">
                  <span>{attendees.get(attendeeId)?.name || "Unknown"}</span>
                  {attendees.get(attendeeId)?.muted && <span className="text-[#de350b]">🔇</span>}
                </div>
              </div>
            ))}
            {videoTiles.size === 0 && (
              <div className="flex flex-col items-center justify-center text-[#5e6c84] bg-white rounded-lg border border-[#dfe1e6]">
                <div className="w-20 h-20 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">📹</span>
                </div>
                <p className="text-lg font-medium text-[#172b4d]">No video streams</p>
                <p className="text-sm mt-2">Turn on your camera to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Screen Share Overlay */}
        {isScreenSharing && (
          <div className="absolute inset-0 bg-[#172b4d] z-10 p-4">
            <video ref={(el) => { if (el) contentShareRef.current = el; }} className="w-full h-full object-contain" autoPlay playsInline />
            <button onClick={toggleScreenShare} className="absolute top-6 right-6 bg-[#de350b] hover:bg-[#bf2600] text-white px-4 py-2 rounded font-medium text-sm shadow-lg">
              Stop Sharing
            </button>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l border-[#dfe1e6] flex flex-col shadow-lg">
            <div className="p-4 border-b border-[#dfe1e6] flex justify-between items-center">
              <h3 className="font-semibold text-[#172b4d]">Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-[#5e6c84] hover:text-[#172b4d] text-2xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafbfc]">
              {chatMessages.map((msg, i) => {
                const isOwnMessage = msg.senderId === currentUserId;
                return (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#172b4d]">{msg.senderName}</span>
                      <span className="text-xs text-[#5e6c84]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`inline-block px-3 py-2 rounded text-sm max-w-[85%] ${isOwnMessage ? 'bg-[#deebff] text-[#172b4d] border border-[#b3d4ff]' : 'bg-white text-[#172b4d] border border-[#dfe1e6]'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-[#dfe1e6] bg-white">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-[#dfe1e6] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0052cc] bg-[#fafbfc]"
                />
                <button onClick={sendChatMessage} className="bg-[#0052cc] hover:bg-[#0747a6] text-white px-4 py-2 rounded text-sm font-medium">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roster Panel */}
        {showRoster && (
          <div className="w-64 bg-white border-l border-[#dfe1e6] flex flex-col shadow-lg">
            <div className="p-4 border-b border-[#dfe1e6] flex justify-between items-center">
              <h3 className="font-semibold text-[#172b4d]">Participants ({attendees.size})</h3>
              <button onClick={() => setShowRoster(false)} className="text-[#5e6c84] hover:text-[#172b4d] text-2xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {Array.from(attendees.values()).map((attendee) => (
                <div key={attendee.attendeeId} className="flex items-center gap-3 p-2 hover:bg-[#f4f5f7] rounded">
                  <div className="w-8 h-8 bg-[#0052cc] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {attendee.name[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm text-[#172b4d] font-medium">{attendee.name}</span>
                  {attendee.muted && <span className="text-[#de350b]">🔇</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg w-[480px] max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-[#dfe1e6] flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#172b4d]">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-[#5e6c84] hover:text-[#172b4d] text-2xl leading-none">×</button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Microphone</label>
                  <select value={selectedAudioInput} onChange={(e) => changeAudioInput(e.target.value)} className="w-full border border-[#dfe1e6] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0052cc] bg-[#fafbfc]">
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Camera</label>
                  <select value={selectedVideoInput} onChange={(e) => changeVideoInput(e.target.value)} className="w-full border border-[#dfe1e6] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0052cc] bg-[#fafbfc]">
                    {videoDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5e6c84] mb-2 uppercase">Speaker</label>
                  <select value={selectedAudioOutput} onChange={(e) => changeAudioOutput(e.target.value)} className="w-full border border-[#dfe1e6] rounded px-3 py-2 text-sm text-[#172b4d] focus:outline-none focus:border-[#0052cc] bg-[#fafbfc]">
                    {audioOutputDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioElementRef} autoPlay style={{ display: 'none' }} />

      {/* Control Bar */}
      <div className="bg-white border-t border-[#dfe1e6] p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <button onClick={toggleAudio} className={`${isAudioMuted ? 'bg-[#de350b] hover:bg-[#bf2600] text-white' : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d]'} w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-sm border border-[#dfe1e6]`} title={isAudioMuted ? "Unmute" : "Mute"}>
            {isAudioMuted ? "🔇" : "🎤"}
          </button>
          <button onClick={toggleVideo} className={`${isVideoEnabled ? 'bg-[#0052cc] hover:bg-[#0747a6] text-white' : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d]'} w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-sm border border-[#dfe1e6]`} title={isVideoEnabled ? "Stop Video" : "Start Video"}>
            {isVideoEnabled ? "📹" : "📷"}
          </button>
          <button onClick={toggleScreenShare} className={`${isScreenSharing ? 'bg-[#00875a] hover:bg-[#006644] text-white' : 'bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d]'} w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-sm border border-[#dfe1e6]`} title="Share Screen">
            🖥️
          </button>
          <button onClick={() => setShowChat(!showChat)} className={`${showChat ? 'bg-[#0052cc] text-white' : 'bg-[#f4f5f7] text-[#172b4d]'} hover:bg-opacity-90 w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-sm border border-[#dfe1e6]`} title="Chat">
            💬
          </button>
          <button onClick={() => setShowRoster(!showRoster)} className={`${showRoster ? 'bg-[#0052cc] text-white' : 'bg-[#f4f5f7] text-[#172b4d]'} hover:bg-opacity-90 w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-sm border border-[#dfe1e6]`} title="Participants">
            👥
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="bg-[#f4f5f7] hover:bg-[#ebecf0] text-[#172b4d] w-12 h-12 rounded-full flex items-center justify-center text-xl transition shadow-sm border border-[#dfe1e6]" title="Settings">
            ⚙️
          </button>
          <div className="w-px h-8 bg-[#dfe1e6] mx-2"></div>
          <button onClick={leaveMeeting} className="bg-[#de350b] hover:bg-[#bf2600] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition shadow-sm">
            Leave Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

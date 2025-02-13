import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../services/allAPI';
import ChatScreen from '../components/chatScreen';
import ChatInput from '../components/ChatInput';
import { socket } from '../App';
import { useNavigate } from 'react-router-dom';
import { FcVideoCall } from "react-icons/fc";
// import VideoCall from '../components/VideoCall';
// import { IoCall } from "react-icons/io5";
// import { ImPhoneHangUp } from "react-icons/im";

const Home = () => {
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUser = JSON.parse(sessionStorage.getItem("user"));
  const [onMessageSent, setOnMessageSent] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  // const [videoCallTrigger, setVideoCallTrigger] = useState(null);
  // const [videoCallNotifier, setVideoCallNotifier] = useState(null);
  // const [videoCallNotifierTrigger, setVideoCallNotifierTrigger] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      socket.on("online", (users) => {
        setOnlineUsers(users);
      });
      allUsersList();
    }
  }, [onlineUsers]);

  useEffect(() => {
    socket.on("incoming-call", ({ from, signal }) => {
      console.log("Hiii")
      console.log(from, signal)
      setVideoCallNotifier({ from, signal });
      setVideoCallNotifierTrigger(true)
    });

    socket.on("call-ended", () => {
      setVideoCallTrigger(false);
      setVideoCallNotifier(false);
    });

   
  }, [])

  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("join", currentUser._id);
    }
  }, []);

  const allUsersList = async () => {
    try {
      const result = await getAllUsers();
      if (result.status === 200) {
        const filteredUsers = result.data.filter(user => user._id !== currentUser._id);
        const sortedUsers = filteredUsers.sort((a, b) => {
          const isAOnline = onlineUsers?.includes(a._id) ? -1 : 1;
          const isBOnline = onlineUsers?.includes(b._id) ? -1 : 1;

          return isAOnline - isBOnline;
        });

        setUsersList(sortedUsers);
      } else {
        alert('Network Error');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return currentUser ? (
    <div className="flex h-screen bg-gray-100 w-full">
      <div className="w-1/5 bg-gray-900 text-white p-4 overflow-y-auto">
        <h1 className='text-2xl font-bold mb-4 underline'>Chat App</h1>
        <h2 className="text-lg font-bold mb-4">Users</h2>
        <ul>
          {usersList.length > 0 ? (
            usersList.map(user => (
              <li
                key={user._id}
                className={`p-2 flex cursor-pointer py-3 items-center my-3 rounded-lg hover:bg-gray-700 ${selectedUser?._id === user._id ? 'bg-gray-700' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                {onlineUsers?.includes(user._id) &&
                  <div className='rounded-full w-2 h-2 bg-green-500 me-2'></div>
                }
                {user.username}
              </li>
            ))
          ) : (
            <div>No Users</div>
          )}
        </ul>
      </div>

      <div className="flex-1 bg-white p-4 flex flex-col">
        {selectedUser ? (
          <>
            <div className="border-b pb-2 mb-2 text-xl font-semibold flex justify-between items-center">
              Chat with {selectedUser.username}
              <div onClick={() => {
                setVideoCallTrigger(true);
                setTimeout(() => {
                  document.getElementById("startCallBtn")?.click();
                }, 3000);
              }}
                className='me-5 border rounded p-2 flex text-slate-500 cursor-pointer transition-all active:bg-green-200 hover:text-black hover:border-green-600 hover:border-2'>
                Start Video Call <FcVideoCall size={30} />
              </div>

            </div>
            <ChatScreen onMessageSent={onMessageSent} selectedUser={selectedUser} />
            <ChatInput setOnMessageSent={setOnMessageSent} selectedUser={selectedUser} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>

      {/* {videoCallTrigger && (
        <div className="border-t pt-2 flex flex-col justify-center items-center absolute top-0 left-0 right-0 h-screen w-full z-10 bg-slate-300">
          <VideoCall
            selectedUser={selectedUser}
            currentUser={currentUser}
            setVideoCallTrigger={setVideoCallTrigger}
          />
        </div>
      )}

      {videoCallNotifier && (
        <div className="absolute top-10 right-10 bg-white p-4 rounded-lg shadow-md border">
          <p className="text-lg font-semibold">Incoming Video Call...</p>
          <p className="text-gray-600">From User {videoCallNotifier?.from || "Unknown"}</p>
          <div className="flex space-x-4 mt-3">
            <button
              onClick={async () => {
                if (!videoCallNotifier) return;

                try {
                  const peerConnection = new RTCPeerConnection();

                  peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                      socket.emit("ice-candidate", event.candidate, videoCallNotifier.from);
                    }
                  };

                  await peerConnection.setRemoteDescription(new RTCSessionDescription(videoCallNotifier.signal));

                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

                  const answer = await peerConnection.createAnswer();
                  await peerConnection.setLocalDescription(answer);

                  socket.emit("answer", { answer, to: videoCallNotifier.from });

                 

                  setVideoCallTrigger(true);
                } catch (error) {
                  console.error("Error accepting call:", error);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Accept
            </button>
            <button onClick={() => setVideoCallNotifier(null)} className="bg-red-500 text-white px-4 py-2 rounded">
              Reject
            </button>
          </div>
        </div>
      )} */}

    </div>
  ) : null;
};

export default Home;
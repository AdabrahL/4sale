# Real-Time Messaging with Video/Audio Calls

## Features Implemented

### 1. **WebRTC Video & Audio Calling**
   - In-browser video and audio calls between users
   - Call controls: mute, camera toggle, end call
   - Picture-in-picture local video preview
   - Incoming call notifications with accept/decline options

### 2. **Media File Sharing**
   - Share images and videos in messages
   - Image preview in chat bubbles (click to view full size)
   - Video playback directly in chat
   - File size limit: 10MB
   - Supported formats: Images (jpg, png, gif, etc.) and Videos (mp4, webm, etc.)

### 3. **Real-Time Socket Communication**
   - WebSocket-based signaling for call setup
   - Online/offline status indicators
   - Typing indicators (ready to implement)
   - Real-time message notifications

## How to Run

### 1. Start the Socket.io Signaling Server

```powershell
cd c:\laragon\www\backend\socket-server
node server.js
```

The server will run on **http://localhost:3000**

### 2. Start the Frontend

```powershell
cd c:\Users\Administrator\Desktop\4Sale\frontend
npm run dev
```

Frontend will run on **http://localhost:5173**

### 3. Start the Laravel Backend

```powershell
cd c:\laragon\www\backend
php artisan serve
```

Backend API will run on **http://localhost:8000** or **http://backend.test**

## How to Use

### Making Calls

1. Go to **Messenger** page (`/messenger`)
2. Select a conversation
3. Click the **phone icon** for audio call or **video camera icon** for video call
4. The other user will receive an incoming call notification
5. They can accept or decline the call
6. Once connected, you can:
   - **Mute/unmute** your microphone
   - **Turn on/off** your camera (video calls only)
   - **End call** at any time

### Sharing Media

1. In the message input area, click the **paperclip icon**
2. Select an image or video (max 10MB)
3. Preview will appear above the input
4. Type a message (optional) and click **Send**
5. The media will appear in the chat:
   - **Images**: Click to open in new tab
   - **Videos**: Play directly in chat

### Sending Messages from Property Details

1. Go to any property detail page (`/properties/:id`)
2. Scroll to the sidebar
3. Type your message in the "Send message to the seller" textarea
4. Click **Send**
5. Messages are now properly saved to the backend

## Backend API Updates Needed

To fully support media uploads, update your Laravel backend:

### 1. Update Message Migration

Add attachment fields to messages table:

```php
$table->string('attachment')->nullable();
$table->string('attachment_type')->nullable();
```

### 2. Update Message Controller

Modify the `contact` and `reply` methods to handle file uploads:

```php
public function contact(Request $request, $propertyId)
{
    $validated = $request->validate([
        'message' => 'nullable|string',
        'attachment' => 'nullable|file|max:10240', // 10MB max
    ]);

    if ($request->hasFile('attachment')) {
        $path = $request->file('attachment')->store('messages', 'public');
        $validated['attachment'] = $path;
        $validated['attachment_type'] = $request->file('attachment')->getMimeType();
    }

    // ... rest of your logic
}
```

## Technical Stack

- **Frontend**: React 19.2.0, Simple-Peer, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **WebRTC**: Simple-Peer library
- **Signaling**: Socket.io for peer connection setup
- **STUN Servers**: Google's public STUN servers

## Troubleshooting

### Camera/Microphone Access Denied
- Check browser permissions
- Ensure HTTPS or localhost (required for WebRTC)
- Try different browser

### Calls Not Connecting
- Ensure Socket.io server is running on port 3000
- Check firewall settings
- Verify CORS settings in signaling server

### Media Upload Failing
- Check file size (must be < 10MB)
- Verify file type (images and videos only)
- Update backend API to accept multipart/form-data
- Check Laravel storage permissions

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (iOS 11+)
- ❌ Internet Explorer (Not supported)

## Security Notes

- WebRTC connections are peer-to-peer (encrypted)
- Socket.io server only handles signaling, not media
- For production, consider using TURN servers for better connectivity
- Implement authentication on Socket.io server
- Add rate limiting for file uploads

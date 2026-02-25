import VideoTile from './VideoTile';

export default function VideoGrid({ localVideoTrack, remoteUsers, userName, localEmotion, remoteEmotions, emotionLabelSlot }) {
  const totalUsers = 1 + remoteUsers.length;

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-0">
      <div
        className="w-full h-full grid gap-3"
        style={{
          gridTemplateColumns: totalUsers <= 1 ? '1fr' : totalUsers <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gridTemplateRows: totalUsers <= 2 ? '1fr' : 'repeat(2, 1fr)',
          maxWidth: totalUsers <= 1 ? '900px' : undefined,
          margin: totalUsers <= 1 ? '0 auto' : undefined,
        }}
      >
        <VideoTile track={localVideoTrack} isLocal name={userName}>
          {emotionLabelSlot?.('local', localEmotion)}
        </VideoTile>
        {remoteUsers.map(user => (
          <VideoTile
            key={user.uid}
            track={user.videoTrack}
            name={`User ${user.uid}`}
          >
            {emotionLabelSlot?.(user.uid, remoteEmotions?.[user.uid])}
          </VideoTile>
        ))}
      </div>
    </div>
  );
}

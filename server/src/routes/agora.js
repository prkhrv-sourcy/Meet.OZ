import { Router } from 'express';
import pkg from 'agora-access-token';
import env from '../config/env.js';

const { RtcTokenBuilder, RtcRole } = pkg;
const router = Router();

router.post('/token', (req, res) => {
  const { channelName, uid } = req.body;

  if (!channelName) {
    return res.status(400).json({ error: 'channelName is required' });
  }

  if (!env.agoraAppId || !env.agoraAppCertificate) {
    return res.status(500).json({ error: 'Agora credentials not configured' });
  }

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    env.agoraAppId,
    env.agoraAppCertificate,
    channelName,
    uid || 0,
    role,
    privilegeExpireTime
  );

  res.json({ token, appId: env.agoraAppId });
});

export default router;

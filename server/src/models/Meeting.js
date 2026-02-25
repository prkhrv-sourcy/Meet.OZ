import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  id: String,
  name: String,
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
}, { _id: false });

const emotionSnapshotSchema = new mongoose.Schema({
  participantId: String,
  participantName: String,
  timestamp: Date,
  emotion: String,
  confidence: Number,
}, { _id: false });

const transcriptSegmentSchema = new mongoose.Schema({
  participantId: String,
  participantName: String,
  text: String,
  timestamp: Date,
  sentiment: String,
}, { _id: false });

const aiSummarySchema = new mongoose.Schema({
  keyMoments: [String],
  emotionalArc: String,
  actionItems: [String],
  presenterScore: Number,
  presenterTips: [String],
  overallSentiment: String,
  generatedAt: Date,
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true },
  title: String,
  hostName: String,
  participants: [participantSchema],
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  startTime: Date,
  endTime: Date,
  emotionSnapshots: [emotionSnapshotSchema],
  transcript: [transcriptSegmentSchema],
  aiSummary: aiSummarySchema,
}, { timestamps: true });

export default mongoose.model('Meeting', meetingSchema);

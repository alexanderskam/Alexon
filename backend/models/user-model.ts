import { Document, Schema, model } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, requuired: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
});

export const User = model('User', UserSchema);

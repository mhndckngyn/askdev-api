import nodemailer from 'nodemailer';
import { constants } from './constants';

const transporter = nodemailer.createTransport({
  service: constants.nodemailer.service,
  auth: {
    user: constants.nodemailer.email,
    pass: constants.nodemailer.password,
  },
});

export default transporter;

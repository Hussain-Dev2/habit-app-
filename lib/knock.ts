import { Knock } from '@knocklabs/node';

const knockClient = new Knock(process.env.KNOCK_SECRET_API_KEY);

export default knockClient;

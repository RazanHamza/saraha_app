import { createClient } from "redis"

export const redis_client = createClient({
    url: "rediss://default:gQAAAAAAAYgAAAIgcDIwNzY2MjkzMDFkMTA0ZDk2YTU4OTAyNGI5NjRkYmE0MQ@unique-pegasus-100352.upstash.io:6379"
});


export default async function connectionRedis() {
  try {
    await redis_client.connect();
    console.log("redis connected successfully......😊");
  } catch (error) {
    console.log("redis connected failed........😒");
  }
}

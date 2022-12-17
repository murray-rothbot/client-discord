export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  DISCORD_API_KEY: parseInt(process.env.DISCORD_API_KEY, 10) || 3000,
})

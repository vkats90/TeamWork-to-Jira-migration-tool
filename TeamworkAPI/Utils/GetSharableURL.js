import 'dotenv/config'

export const GetSharableURL = async (id) => {
  const baseURL = 'https://jampaper.teamwork.com'
  const teamworkAuth = process.env.TEAMWORK_AUTH_TOKEN
  try {
    const response = await fetch(`${baseURL}/files/${id}/sharedlink.json`, {
      method: 'GET',
      headers: {
        authorization: teamworkAuth,
      },
    })
    const data = await response.json()
    if (data && data.STATUS === 'OK') {
      return data.url
    } else {
      return null
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

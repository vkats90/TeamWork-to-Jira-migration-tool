import { MainListParser } from './Utils/MainListParser.js'
import 'dotenv/config'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const config = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url), 'utf8'))
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const teamworkAuth = process.env.TEAMWORK_AUTH_TOKEN

const getRecords = async () => {
  let data
  let i = 1
  let mainList = []
  try {
    do {
      const response = await fetch(
        `${config.baseURL}/projects/api/v3/tasks.json?projectIds=${config.project}&includeCompletedTasks=true&includeAllComments=true&groupByTasklist=true&completedOnly=false&include=comments,attachments,users,tasklists&fields[tasks]=id,name,description,status,tasklistId,assignees,attachments,createdBy,createdAt&page=${i}&pageSize=500`,
        {
          method: 'GET',
          headers: {
            authorization: teamworkAuth,
          },
        }
      )
      data = await response.json()

      const parsed = await MainListParser(data)
      if (parsed) mainList = parsed
      const outDir = path.join(__dirname, 'output')
      fs.mkdirSync(outDir, { recursive: true })
      const outPath = path.join(outDir, `${config.projectName}-${i}.json`)
      fs.writeFileSync(
        outPath,
        JSON.stringify(mainList.length === 1 ? mainList[0] : mainList, null, 2),
        'utf8'
      )
      i++
    } while (data.tasks.length === 500)
  } catch (err) {
    console.error(err)
  }
}

getRecords()

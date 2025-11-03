import { stripTags } from './stripTags.js'
import { GetSharableURL } from './GetSharableURL.js'
import config from '../../config.json' assert { type: 'json' }

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

export const MainListParser = async (data) => {
  const users = []
  Object.entries(data.included.users).forEach((user) => {
    users.push({
      id: user[1].id,
      name: user[1].firstName + ' ' + user[1].lastName,
      email: user[1].email.replace('jambnc', 'jamplus'),
    })
  })
  let processed = 0 // count processed task "records"
  const tasks = []
  for (const [, task] of Object.entries(data.tasks)) {
    const comments = Object.entries(data.included.comments)
      .filter((comment) => comment[1].objectId === task.id)
      .map((c) => ({
        body: stripTags(c[1].title),
        author:
          data.included.users[c[1].postedBy.id]?.firstName +
          ' ' +
          data.included.users[c[1].postedBy.id]?.lastName,
        created: c[1].postedAt,
      }))

    const attachments = []
    for (const [, attachment] of Object.entries(task.attachments || {})) {
      const accAttachment = data.included.files[attachment.id]
      if (accAttachment) {
        const uri = await GetSharableURL(accAttachment.id)
        attachments.push({
          name: accAttachment.displayName,
          uri,
          attacher:
            data.included.users[accAttachment.uploadedBy]?.firstName +
            ' ' +
            data.included.users[accAttachment.uploadedBy]?.lastName,
          created: accAttachment.uploadedAt,
        })
      }
    }

    console.log(`task ${tasks.length + 1}/${Object.keys(data.tasks).length}`)

    tasks.push({
      externalId: task.id,
      workType: 'Sub-task',
      summary: task.name,
      description: task.description,
      status:
        task.status == 'completed' ? 'Done' : data.included.tasklists[task.tasklistId]?.name || '',
      reporter:
        data.included.users[task.createdBy].firstName +
        ' ' +
        data.included.users[task.createdBy].lastName,
      created: task.createdAt,
      assignee:
        data.included.users[task.assignees[0]?.id]?.firstName +
        ' ' +
        data.included.users[task.assignees[0]?.id]?.lastName,
      fixedVersions: ['1.0'],
      comments,
      attachments,
    })

    processed++
    // every 100 records, wait 0.5 minute (30s) to respect 300 calls/min limit
    if (processed % 100 === 0) {
      console.log(`Processed ${processed} tasks — pausing 30s to respect API rate limits`)
      await sleep(30 * 1000)
    }
  }

  return {
    users: users,
    projects: [
      {
        name: config.projectName,
        issues: tasks,
      },
    ],
  }
}

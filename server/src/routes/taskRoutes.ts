import { Router } from 'express'
import { z } from 'zod'
import type { Request, Response } from 'express'
import type { TaskStatus, TaskSource } from '../models/Task.js'
import { listTasks, getTask, createTask, updateTask, deleteTask } from '../services/taskService.js'
import type { AuthenticatedUser } from '../middleware/requestUser.js'

const router = Router()

const createSchema = z.object({
  leadId: z.string().optional(),
  clientId: z.string().optional(),
  assignedAdvisorId: z.string(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().datetime(),
  source: z.enum(['MANUAL', 'STAGE_TRIGGER']).optional(),
  triggerStage: z.string().optional(),
  brokerageId: z.string().optional(),
})

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['OPEN', 'COMPLETED']).optional(),
})

function parseOrRespond<T>(schema: z.ZodType<T>, input: unknown, response: Response): T | null {
  const result = schema.safeParse(input)
  if (!result.success) {
    response.status(400).json({ error: result.error.issues[0]?.message ?? 'Invalid request.' })
    return null
  }
  return result.data
}

function getParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${name}.`)
  return value
}

export async function listTasksController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  const brokerageId = typeof request.query.brokerageId === 'string' ? request.query.brokerageId : undefined
  const advisorId = typeof request.query.advisorId === 'string' ? request.query.advisorId : undefined
  response.json({ tasks: await listTasks(user, brokerageId, advisorId) })
}

export async function getTaskController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  response.json({ task: await getTask(user, getParam(request.params.taskId, 'task ID')) })
}

export async function createTaskController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  const input = parseOrRespond(createSchema, request.body, response)
  if (!input) return

  // Add brokerageId from user if not platform admin
  if (user.role !== 'PLATFORM_ADMIN' && user.brokerageId && !input.brokerageId) {
    input.brokerageId = user.brokerageId
  }

  response.status(201).json({ task: await createTask(user, input) })
}

export async function updateTaskController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  const patch = parseOrRespond(patchSchema, request.body, response)
  if (!patch) return
  response.json({ task: await updateTask(user, getParam(request.params.taskId, 'task ID'), patch) })
}

export async function deleteTaskController(request: Request, response: Response): Promise<void> {
  const user = request.user as AuthenticatedUser
  await deleteTask(user, getParam(request.params.taskId, 'task ID'))
  response.status(204).end()
}

import { requireAuth } from '../middleware/requireAuth.js'
import { requireRole } from '../middleware/requireRole.js'
import { ROLES } from '../models/roles.js'

router.use(requireAuth)
router.get('/', listTasksController)
router.get('/:taskId', getTaskController)
router.post('/', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR, ROLES.PLATFORM_ADMIN), createTaskController)
router.patch('/:taskId', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.ADVISOR, ROLES.PLATFORM_ADMIN), updateTaskController)
router.delete('/:taskId', requireRole(ROLES.BROKERAGE_ADMIN, ROLES.PLATFORM_ADMIN), deleteTaskController)

export const taskRouter = router
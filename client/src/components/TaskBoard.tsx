import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../auth/useAuth'
import { fetchTasks, createTask, completeTask, type Task } from '../services/tasks'

export function TaskBoard() {
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedAdvisorId: user?.id || '',
  })

  const loadTasks = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = await fetchTasks(token)
      setTasks(data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleCreateTask() {
    if (!token || !formData.title.trim()) return
    try {
      const created = await createTask(token, {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      })
      setTasks([created, ...tasks])
      setFormData({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        assignedAdvisorId: user?.id || '',
      })
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    }
  }

  async function handleCompleteTask(taskId: string) {
    if (!token) return
    try {
      const updated = await completeTask(token, taskId)
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task')
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function isOverdue(dueDate: string, status: string): boolean {
    return status === 'OPEN' && new Date(dueDate) < new Date()
  }

  const openTasks = tasks.filter((t) => t.status === 'OPEN').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')

  if (loading) return <div className="p-4">Loading tasks...</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Task'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-3">Create New Task</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task Title"
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <textarea
              placeholder="Description (optional)"
              className="w-full p-2 border rounded h-20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleCreateTask}
              >
                Create
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Tasks */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Open Tasks ({openTasks.length})</h3>
        {openTasks.length === 0 ? (
          <p className="text-gray-500">No open tasks.</p>
        ) : (
          <div className="space-y-3">
            {openTasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status)
              return (
                <div key={task.id} className={`p-4 border rounded ${overdue ? 'bg-red-50 border-red-300' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${overdue ? 'text-red-700' : ''}`}>
                        {task.title}
                        {overdue && <span className="ml-2 text-xs font-normal text-red-600">OVERDUE</span>}
                        {task.source === 'STAGE_TRIGGER' && (
                          <span className="ml-2 text-xs text-gray-500">(Auto: {task.triggerStage})</span>
                        )}
                      </h4>
                      {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                      <p className={`text-sm mt-1 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <button
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Completed Tasks ({completedTasks.length})</h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div key={task.id} className="p-3 border rounded bg-gray-50 line-through text-gray-500">
                <h4 className="font-semibold">{task.title}</h4>
                <p className="text-sm">
                  Completed: {formatDate(task.completedAt || new Date().toISOString())}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
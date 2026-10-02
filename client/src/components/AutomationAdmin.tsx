import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { Button } from './ui/Button'
import { fetchEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, type EmailTemplate } from '../services/emailTemplates'
import { fetchEmailTriggers, createEmailTrigger, updateEmailTrigger, deleteEmailTrigger, type EmailTrigger } from '../services/emailTriggers'
import { fetchTaskTriggers, createTaskTrigger, updateTaskTrigger, deleteTaskTrigger, type TaskTrigger } from '../services/taskTriggers'

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPLICATION', 'WON', 'LOST'] as const
const PLACEHOLDERS = ['{{clientName}}', '{{advisorName}}', '{{leadName}}']

type Tab = 'email-templates' | 'email-triggers' | 'task-triggers'

export function AutomationAdmin() {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('email-templates')
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [emailTriggers, setEmailTriggers] = useState<EmailTrigger[]>([])
  const [taskTriggers, setTaskTriggers] = useState<TaskTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '', active: true })
  const [emailTriggerForm, setEmailTriggerForm] = useState({ stage: 'NEW', templateId: '', active: true })
  const [taskTriggerForm, setTaskTriggerForm] = useState({ stage: 'NEW', title: '', description: '', dueDays: 2, active: true })
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [editingEmailTriggerId, setEditingEmailTriggerId] = useState<string | null>(null)
  const [editingTaskTriggerId, setEditingTaskTriggerId] = useState<string | null>(null)

  useEffect(() => {
    if (!token || user?.role !== 'BROKERAGE_ADMIN') return

    Promise.all([
      fetchEmailTemplates(token),
      fetchEmailTriggers(token),
      fetchTaskTriggers(token),
    ])
      .then(([templates, eTriggers, tTriggers]) => {
        setEmailTemplates(templates)
        setEmailTriggers(eTriggers)
        setTaskTriggers(tTriggers)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, user?.role])

  if (user?.role !== 'BROKERAGE_ADMIN') {
    return <div className="p-4 text-gray-500">This section is for Brokerage Admins only.</div>
  }

  if (loading) return <div className="p-4">Loading automation configuration...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  // Email Templates Handlers
  async function handleCreateTemplate() {
    if (!token) return
    try {
      const created = await createEmailTemplate(token, templateForm)
      setEmailTemplates([...emailTemplates, created])
      setTemplateForm({ name: '', subject: '', body: '', active: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
    }
  }

  async function handleUpdateTemplate(id: string) {
    if (!token) return
    try {
      const updated = await updateEmailTemplate(token, id, templateForm)
      setEmailTemplates(emailTemplates.map((t) => (t.id === id ? updated : t)))
      setEditingTemplateId(null)
      setTemplateForm({ name: '', subject: '', body: '', active: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template')
    }
  }

  async function handleDeleteTemplate(id: string) {
    if (!token) return
    try {
      await deleteEmailTemplate(token, id)
      setEmailTemplates(emailTemplates.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    }
  }

  function startEditTemplate(template: EmailTemplate) {
    setEditingTemplateId(template.id)
    setTemplateForm({ name: template.name, subject: template.subject, body: template.body, active: template.active })
  }

  // Email Triggers Handlers
  async function handleCreateEmailTrigger() {
    if (!token || !emailTriggerForm.templateId) return
    try {
      const created = await createEmailTrigger(token, emailTriggerForm)
      setEmailTriggers([...emailTriggers, created])
      setEmailTriggerForm({ stage: 'NEW', templateId: '', active: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trigger')
    }
  }

  async function handleUpdateEmailTrigger(id: string) {
    if (!token) return
    try {
      const updated = await updateEmailTrigger(token, id, emailTriggerForm)
      setEmailTriggers(emailTriggers.map((t) => (t.id === id ? updated : t)))
      setEditingEmailTriggerId(null)
      setEmailTriggerForm({ stage: 'NEW', templateId: '', active: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trigger')
    }
  }

  async function handleDeleteEmailTrigger(id: string) {
    if (!token) return
    try {
      await deleteEmailTrigger(token, id)
      setEmailTriggers(emailTriggers.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trigger')
    }
  }

  // Task Triggers Handlers
  async function handleCreateTaskTrigger() {
    if (!token) return
    try {
      const created = await createTaskTrigger(token, taskTriggerForm)
      setTaskTriggers([...taskTriggers, created])
      setTaskTriggerForm({ stage: 'NEW', title: '', description: '', dueDays: 2, active: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trigger')
    }
  }

  async function handleUpdateTaskTrigger(id: string) {
    if (!token) return
    try {
      const updated = await updateTaskTrigger(token, id, taskTriggerForm)
      setTaskTriggers(taskTriggers.map((t) => (t.id === id ? updated : t)))
      setEditingTaskTriggerId(null)
      setTaskTriggerForm({ stage: 'NEW', title: '', description: '', dueDays: 2, active: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trigger')
    }
  }

  async function handleDeleteTaskTrigger(id: string) {
    if (!token) return
    try {
      await deleteTaskTrigger(token, id)
      setTaskTriggers(taskTriggers.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trigger')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Automation Configuration</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'email-templates' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('email-templates')}
        >
          Email Templates
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'email-triggers' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('email-triggers')}
        >
          Stage Email Triggers
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'task-triggers' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('task-triggers')}
        >
          Task Triggers
        </button>
      </div>

      {/* Email Templates Tab */}
      {activeTab === 'email-templates' && (
        <div>
          <div className="mb-6 p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground">
              {editingTemplateId ? 'Edit Template' : 'Create New Template'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Template Name"
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              />
              <textarea
                placeholder="Email Body (use {{clientName}}, {{advisorName}}, {{leadName}} as placeholders)"
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground h-32"
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="templateActive"
                  className="rounded border-input text-primary focus:ring-primary"
                  checked={templateForm.active}
                  onChange={(e) => setTemplateForm({ ...templateForm, active: e.target.checked })}
                />
                <label htmlFor="templateActive" className="text-sm font-medium text-foreground">Active</label>
              </div>
              <div className="text-sm text-muted-foreground">
                Available placeholders: {PLACEHOLDERS.join(', ')}
              </div>
              <div className="flex gap-2">
                {editingTemplateId ? (
                  <>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleUpdateTemplate(editingTemplateId)}
                    >
                      Update
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => {
                        setEditingTemplateId(null)
                        setTemplateForm({ name: '', subject: '', body: '', active: true })
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleCreateTemplate}
                  >
                    Create Template
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {emailTemplates.map((template) => (
              <div key={template.id} className="p-6 bg-card border border-border rounded-xl shadow-sm flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground">
                    {template.name}
                    {!template.active && <span className="ml-2 text-xs text-muted-foreground">(Inactive)</span>}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Subject: {template.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.body}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEditTemplate(template)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {emailTemplates.length === 0 && (
              <p className="text-muted-foreground italic">No email templates configured.</p>
            )}
          </div>
        </div>
      )}

      {/* Email Triggers Tab */}
      {activeTab === 'email-triggers' && (
        <div>
          <div className="mb-6 p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground">
              {editingEmailTriggerId ? 'Edit Email Trigger' : 'Create New Email Trigger'}
            </h3>
            <div className="space-y-4">
              <select
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                value={emailTriggerForm.stage}
                onChange={(e) => setEmailTriggerForm({ ...emailTriggerForm, stage: e.target.value })}
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <select
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                value={emailTriggerForm.templateId}
                onChange={(e) => setEmailTriggerForm({ ...emailTriggerForm, templateId: e.target.value })}
              >
                <option value="">Select a template...</option>
                {emailTemplates.filter((t) => t.active).map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.subject}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailTriggerActive"
                  className="rounded border-input text-primary focus:ring-primary"
                  checked={emailTriggerForm.active}
                  onChange={(e) => setEmailTriggerForm({ ...emailTriggerForm, active: e.target.checked })}
                />
                <label htmlFor="emailTriggerActive" className="text-sm font-medium text-foreground">Active</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={editingEmailTriggerId ? () => handleUpdateEmailTrigger(editingEmailTriggerId) : handleCreateEmailTrigger}>
                    {editingEmailTriggerId ? 'Update' : 'Create Trigger'}
                </Button>
                {editingEmailTriggerId && (
                  <Button variant="outline" onClick={() => { setEditingEmailTriggerId(null); setEmailTriggerForm({ stage: 'NEW', templateId: '', active: true }); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {emailTriggers.map((trigger) => (
              <div key={trigger.id} className="p-6 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Stage: {trigger.stage}
                      {!trigger.active && <span className="ml-2 text-xs text-muted-foreground">(Inactive)</span>}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Template: {trigger.templateName || 'N/A'}
                    </p>
                    {trigger.templateSubject && (
                      <p className="text-sm text-muted-foreground mt-1">Subject: {trigger.templateSubject}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        setEditingEmailTriggerId(trigger.id)
                        setEmailTriggerForm({
                          stage: trigger.stage,
                          templateId: trigger.templateId,
                          active: trigger.active,
                        })
                      }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteEmailTrigger(trigger.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {emailTriggers.length === 0 && (
              <p className="text-muted-foreground italic">No email triggers configured.</p>
            )}
          </div>
        </div>
      )}

      {/* Task Triggers Tab */}
      {activeTab === 'task-triggers' && (
        <div>
          <div className="mb-6 p-6 bg-card border border-border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground">
              {editingTaskTriggerId ? 'Edit Task Trigger' : 'Create New Task Trigger'}
            </h3>
            <div className="space-y-4">
              <select
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                value={taskTriggerForm.stage}
                onChange={(e) => setTaskTriggerForm({ ...taskTriggerForm, stage: e.target.value })}
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Task Title"
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                value={taskTriggerForm.title}
                onChange={(e) => setTaskTriggerForm({ ...taskTriggerForm, title: e.target.value })}
              />
              <textarea
                placeholder="Task Description (optional)"
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground h-20"
                value={taskTriggerForm.description}
                onChange={(e) => setTaskTriggerForm({ ...taskTriggerForm, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Due in (days)"
                className="w-full p-2.5 border border-input bg-background rounded-lg text-foreground"
                min={1}
                max={365}
                value={taskTriggerForm.dueDays}
                onChange={(e) => setTaskTriggerForm({ ...taskTriggerForm, dueDays: parseInt(e.target.value) || 1 })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="taskTriggerActive"
                  className="rounded border-input text-primary focus:ring-primary"
                  checked={taskTriggerForm.active}
                  onChange={(e) => setTaskTriggerForm({ ...taskTriggerForm, active: e.target.checked })}
                />
                <label htmlFor="taskTriggerActive" className="text-sm font-medium text-foreground">Active</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={editingTaskTriggerId ? () => handleUpdateTaskTrigger(editingTaskTriggerId) : handleCreateTaskTrigger}>
                    {editingTaskTriggerId ? 'Update' : 'Create Trigger'}
                </Button>
                {editingTaskTriggerId && (
                  <Button variant="outline" onClick={() => { setEditingTaskTriggerId(null); setTaskTriggerForm({ stage: 'NEW', title: '', description: '', dueDays: 1, active: true }); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {taskTriggers.map((trigger) => (
              <div key={trigger.id} className="p-6 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {trigger.stage} → {trigger.title}
                      {!trigger.active && <span className="ml-2 text-xs text-muted-foreground">(Inactive)</span>}
                    </h4>
                    {trigger.description && (
                      <p className="text-sm text-muted-foreground mt-1">{trigger.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">Due: {trigger.dueDays} day(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        setEditingTaskTriggerId(trigger.id)
                        setTaskTriggerForm({
                          stage: trigger.stage,
                          title: trigger.title,
                          description: trigger.description || '',
                          dueDays: trigger.dueDays,
                          active: trigger.active,
                        })
                      }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTaskTrigger(trigger.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {taskTriggers.length === 0 && (
              <p className="text-muted-foreground italic">No task triggers configured.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
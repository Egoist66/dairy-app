export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  estimatedMinutes: number
  actualTimeSpent: number
  color: string
  createdAt: string
}

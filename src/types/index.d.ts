import type { AvatarProps, IconComponent } from '@bitrix24/b24ui-nuxt'
import type { ISODate } from '@bitrix24/b24jssdk'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'success' | 'failed' | 'processing'
export type Semantic = 'P' | 'S' | 'F'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: IconComponent
  value: number | string
  variation: null | number
  formatter?: (value: number, currencyId: string) => string
}

export interface Sale {
  id: number
  begindate: string
  closedate: null | string
  status: SaleStatus
  title: string
  amount: number
  currencyId: string
  stageSemanticId: Semantic
  isCanOpen: boolean
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export type DataRecord = {
  date: Date
  amount: Record<string, number>
}

export type Deal = {
  id: number
  contactId: number
  companyId: number
  title: string
  begindate: ISODate
  closedate: ISODate
  opportunity: number
  currencyId: string
  stageSemanticId: Semantic
}

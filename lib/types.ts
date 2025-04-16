export interface Link {
  id: string
  short_code: string
  original_url: string
  user_id: string
  clicks: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Click {
  id: string
  link_id: string
  referrer: string
  user_agent: string
  ip_address: string
  created_at: string
}

export interface User {
  id: string
  email: string
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xwvcwcxyztcfwcnlihfd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dmN3Y3h5enRjZndjbmxpaGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjA3ODEsImV4cCI6MjA2ODc5Njc4MX0.dVbepsKYVXh6lYWwvYpoM0f6yrPXhII9iH5ATnrFwjs'
export const supabase = createClient(supabaseUrl, supabaseKey) 
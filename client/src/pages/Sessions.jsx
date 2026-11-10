import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../config/api'
import EmptySessions from '../components/sessions/EmptySessions'
import SessionCard from '../components/sessions/SessionCard'
import SessionDetailModal from '../components/sessions/SessionDetailModal'
import Loader from '../components/Loader'

export const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const navigate = useNavigate()
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    let cancelled = false

    const fetchSessions = async () => {
      try {
        const token = await getToken()
        if (!token) {
          throw new Error('Could not get an authentication token.')
        }

        const { data } = await api.get('/api/meetings/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!cancelled) {
          setSessions(data.meetings || [])
          setLoadError('')
        }
      } catch (error) {
        if (!cancelled) {
          const message = error.response?.data?.error || error.message || 'Failed to load meeting sessions'
          setLoadError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchSessions()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, getToken])

  const openSessionDetails = async (meetingId) => {
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Could not get an authentication token.')
      }

      const { data } = await api.get(`/api/meetings/sessions/${encodeURIComponent(meetingId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSelectedSession(data.meeting)
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Could not fetch session details')
    }
  }

  if (loading) {
    return <Loader text='Loading meeting history...' />
  }

  return (
    <main className='flex-1 max-w-7xl w-full mx-auto p-6 md:p-12'>
      <Link to="/dashboard" className='flex items-center text-sm gap-1 mb-4 text-slate-500
      hover:text-slate-900 transition-colors'>
        <ArrowLeftIcon size={14} /> Go to Dashboard
      </Link>
      <div className='mb-8'>
        <h1 className='text-3xl font-medium tracking-tight text-slate-900'>
          Meeting sessions.
        </h1>
        <p className='text-sm text-slate-500 mt-1'>Review your past and active meeting history, participant logs, and chat transcripts. </p>
      </div>

      {loadError ? (
        <p role="alert" className='text-sm text-rose-600'>{loadError}</p>
      ) : sessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpenDetails={openSessionDetails}
              onRejoin={(meetingId) => navigate(`/meeting/${meetingId}`)}
            />
          ))}
        </div>
      )}

      <SessionDetailModal
        key={selectedSession?.meetingId || 'no-session'}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </main>
  )
}

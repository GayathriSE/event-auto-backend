import { addParticipants, callback, createCalendarEvent, getEventParticipantDetails, login } from '../controller/index.js'
import express from 'express'

const router = express.Router()

router.post('/create-google-event',createCalendarEvent)
router.put('/add-participants',addParticipants)
router.get('/login',login)
router.get('/call-back',callback)
router.get('/get-participants',getEventParticipantDetails)





export const eventsRouter = router
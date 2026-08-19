import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';

const localizer = momentLocalizer(moment);

const HearingsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchHearings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/firm/hearings');
        
        // Transform hearings database records into React Big Calendar event objects
        const formattedEvents = response.data.map((h) => {
          const hearingDateStr = h.hearingDate.split('T')[0]; // YYYY-MM-DD
          const [hours, minutes] = h.hearingTime.split(':');
          
          const start = new Date(hearingDateStr);
          start.setHours(parseInt(hours), parseInt(minutes), 0);
          
          const end = new Date(start);
          end.setHours(start.getHours() + 1); // Mock 1 hour slot
          
          return {
            id: h.id,
            title: `[${h.case?.caseNumber || 'No Code'}] ${h.purpose}`,
            start,
            end,
            resource: h,
          };
        });
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching calendar hearings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHearings();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setOpen(true);
  };

  if (loading) return <LoadingScreen message="Assembling Scheduler Calendar..." />;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
        Hearings Calendar
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              style={{ height: '100%' }}
              // Custom styles for dark/light mode integration
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: '#0284c7',
                  borderRadius: '6px',
                  color: 'white',
                  border: 'none',
                  display: 'block',
                  fontSize: '0.85rem',
                  padding: '2px 6px',
                },
              })}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Hearing Summary</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          <Typography variant="body2">
            <b>Case File:</b> {selectedEvent?.case?.caseTitle}
          </Typography>
          <Typography variant="body2">
            <b>Case Number:</b> {selectedEvent?.case?.caseNumber}
          </Typography>
          <Typography variant="body2">
            <b>Scheduled Time:</b> {selectedEvent && new Date(selectedEvent.hearingDate).toLocaleDateString()} at {selectedEvent?.hearingTime}
          </Typography>
          <Typography variant="body2">
            <b>Purpose of Session:</b> {selectedEvent?.purpose}
          </Typography>
          <Typography variant="body2">
            <b>Lead Counsel:</b> {selectedEvent?.case?.advocate?.fullName}
          </Typography>
          <Typography variant="body2">
            <b>Court Location:</b> {selectedEvent?.case?.court?.courtName}
          </Typography>
          <Typography variant="body2">
            <b>Presiding Judge:</b> {selectedEvent?.case?.judge?.judgeName}
          </Typography>
          {selectedEvent?.result && (
            <Typography variant="body2">
              <b>Result Log:</b> {selectedEvent.result}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Close Summary</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
              navigate(`/firm/cases/${selectedEvent?.caseId}`);
            }}
          >
            Go to Case Workspace
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HearingsCalendar;

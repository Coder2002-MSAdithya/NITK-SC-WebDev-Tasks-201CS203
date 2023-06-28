import React, { useState } from 'react';
import { Calendar, Modal, Button } from 'antd';

// Sample event data
const eventData = [
    {
      id: 1,
      title: 'Club Meeting 1',
      startDate: '2023-07-10',
      endDate: '2023-07-11',
      startTime: "15:00",
      endTime: "17:00",
      location: 'Student Center, Room 101',
      description: 'Monthly club meeting to discuss upcoming events and activities.',
    },
    {
      id: 2,
      title: 'Club Meeting 2',
      startDate: '2023-07-10',
      endDate: '2023-07-11',
      startTime: "15:00",
      endTime: "17:00",
      location: 'Student Center, Room 101',
      description: 'Monthly club meeting to discuss upcoming events and activities.',
    },
];

const EventsCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Function to handle event selection
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // Render the event list for a specific date
  const renderEventList = (date) => {
    const eventsForDate = eventData.filter((event) => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      return date >= eventStartDate && date <= eventEndDate;
    });

    return (
      <ul>
        {eventsForDate.map((event) => (
          <li key={event.id} onClick={() => handleEventClick(event)}>
            {event.title}
          </li>
        ))}
      </ul>
    );
  };

  // Customize date cell render to display event badges
  const dateCellRender = (date) => {
    const hasEvents = eventData.some((event) => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);
      return date >= eventStartDate && date <= eventEndDate;
    });

    return hasEvents ? <div className="event-badge" /> : null;
  };

  const handleRSVP = () => {
    // Simulating RSVP confirmation
    Modal.success({
      title: 'RSVP Confirmed',
      content: 'You have successfully RSVPed for the event!',
    });
  };

  return (
    <div>
      <h1>College Club Events Calendar</h1>
      <Calendar cellRender={dateCellRender} />
      <Modal
        title={selectedEvent ? selectedEvent.title : ''}
        open={!!selectedEvent}
        onCancel={() => setSelectedEvent(null)}
        footer={[
          <Button key="rsvp" type="primary" onClick={handleRSVP}>
            RSVP
          </Button>,
        ]}
      >
        {selectedEvent && (
          <div>
            <p>
              Date: {selectedEvent.startDate} - {selectedEvent.endDate}
            </p>
            <p>
              Time: {selectedEvent.startTime} - {selectedEvent.endTime}
            </p>
            <p>Location: {selectedEvent.location}</p>
            <p>Description: {selectedEvent.description}</p>
            {/* Add additional event details here */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventsCalendar;

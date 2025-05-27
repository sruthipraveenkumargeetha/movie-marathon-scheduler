# Movie Marathon Scheduler

A simple tool to help plan movie marathons by considering movie durations, showtimes, and desired break times.

## Current Features

*   Add movies with title, duration, and showtimes.
*   Parse flexible duration inputs (e.g., "1hr 30min", "90min").
*   Parse multi-line showtime inputs, including AM/PM conversion.
*   Generate possible marathon schedules based on user preferences (number of movies, break time, earliest start).
*   Display generated schedules in a responsive column layout.

## Pending Features

- [ ] **User Accounts:** Allow users to save their movie lists and preferences.
- [ ] **Movie Poster Display:** Show movie posters alongside details in the schedule.
- [ ] **Advanced Search for TMDb:**
    - [ ] Show a list of suggestions from TMDb as the user types the movie title.
    - [ ] Allow user to select the correct movie from suggestions.
- [ ] **Manual Reordering of Movies in Schedule:** Allow users to drag and drop movies to adjust a generated schedule.
- [ ] **Shareable Schedule Link:** Generate a unique link to share a specific marathon schedule.
- [ ] **Dark Mode / Theme Options.**
- [ ] **Export Schedule:** Option to export the schedule to a calendar or text file.
- [ ] **More Sorting/Filtering Options for Schedules:** (e.g., shortest total time, latest end time).
- [ ] **Conflict Detection for Showtimes:** Warn if showtimes for the same movie overlap.

## How to Use

1.  Set your marathon preferences (number of movies, break time, earliest start).
2.  Add movies one by one, providing title, duration, and showtimes.
    *   Movie duration will attempt to auto-populate from TMDb after you type the title and move to another field.
3.  Click "Generate Marathon Schedule".
4.  Review the suggested schedules.

## Technologies Used

*   HTML
*   CSS (with Flexbox for layout)
*   JavaScript (Vanilla JS)

## Setup for Local Development

1.  Clone the repository.
2.  Open `index.html` in your browser.
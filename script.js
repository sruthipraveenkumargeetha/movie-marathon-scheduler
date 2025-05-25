// Wait for the HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements we'll interact with
    const movieTitleInput = document.getElementById('movieTitle');
    const movieDurationInput = document.getElementById('movieDuration');
    const movieShowtimesInput = document.getElementById('movieShowtimes');
    const addMovieButton = document.getElementById('addMovieButton');
    const addedMoviesList = document.getElementById('addedMoviesList');
    const scheduleResultsDiv = document.getElementById('scheduleResults');

    // This array will store all the movie objects the user adds
    let moviesForMarathon = [];

    // Event listener for the "Add Movie" button
    addMovieButton.addEventListener('click', () => {
        // 1. Get the values from the input fields
        const title = movieTitleInput.value.trim();
        const durationStr = movieDurationInput.value; // Get duration as string first
        const duration = parseDurationToMinutes(durationStr); // Use new parsing function
        const showtimesRaw = movieShowtimesInput.value.trim();

        // Basic Validation (we can make this more robust later)
        if (!title) {
            alert('Please enter a movie title.');
            return; // Stop if no title
        }
        if (duration === null || duration <= 0) { 
            alert('Please enter a valid movie duration (e.g., 1hr 30min, 90min, or 90).');
            return; // Stop if duration is not valid
        }
        if (!showtimesRaw) {
            alert('Please enter at least one showtime.');
            return; // Stop if no showtimes
        }

        // 2. Process showtimes: split the comma-separated string into an array of strings
        //    We'll also trim whitespace from each showtime.
        //    Example: "10:30, 13:15, 16:00" becomes ["10:30", "13:15", "16:00"]
        const showtimesArray = showtimesRaw.split(',').map(time => time.trim()).filter(time => time !== "");

        if (showtimesArray.length === 0) {
            alert('Please enter valid showtimes, separated by commas.');
            return;
        }

        // 3. Create a movie object
        const newMovie = {
            title: title,
            durationMinutes: duration,
            showtimes: showtimesArray // Store them as an array of strings for now
        };

        // 4. Add the new movie object to our array
        moviesForMarathon.push(newMovie);

        // 5. Update the display of added movies
        renderAddedMovies();

        // 6. Clear the input fields for the next movie
        movieTitleInput.value = '';
        movieDurationInput.value = '';
        movieShowtimesInput.value = '';
        movieTitleInput.focus(); // Put cursor back in the title field

        console.log('Current moviesForMarathon:', moviesForMarathon); // For debugging
    });

    // Function to display the list of added movies
    function renderAddedMovies() {
    addedMoviesList.innerHTML = '';

    if (moviesForMarathon.length === 0) {
        addedMoviesList.innerHTML = '<li><em>No movies added yet.</em></li>';
        return;
    }

    moviesForMarathon.forEach((movie, index) => {
        const listItem = document.createElement('li');
        // Use the new formatting function here too
        const durationFormatted = formatDurationFromMinutes(movie.durationMinutes);
        listItem.textContent = `${index + 1}. ${movie.title} (${durationFormatted}) - Showtimes: ${movie.showtimes.join(', ')}`;
        addedMoviesList.appendChild(listItem);
    });
}


    // Helper function to convert "HH:MM" string to minutes since midnight
    function timeToMinutes(timeStr) {
        if (!timeStr || !timeStr.includes(':')) {
            console.error("Invalid time string format:", timeStr);
            return null;
        }
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.error("Invalid time values in string:", timeStr);
            return null;
        }
        return hours * 60 + minutes;
    }   

    // Helper function to convert minutes since midnight back to "HH:MM" string
    function minutesToTime(totalMinutes) {
        if (isNaN(totalMinutes) || totalMinutes < 0) {
            console.error("Invalid total minutes:", totalMinutes);
            return "00:00";
        }
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    // Helper function to parse various duration string formats to total minutes
    function parseDurationToMinutes(durationStr) {
        if (!durationStr) return null;
        durationStr = String(durationStr).toLowerCase().trim();

        let totalMinutes = 0;

        // Regex to capture hours and minutes
        // It looks for patterns like "Xhr Ymin", "Xh Ym", "Xhr", "Xh", "Ymin", "Ym"
        // It also handles optional spaces around hr/h and min/m
        const hourMatch = durationStr.match(/(\d+)\s*(?:hr|h)/);
        const minMatch = durationStr.match(/(\d+)\s*(?:min|m)/);

        if (hourMatch && hourMatch[1]) {
            totalMinutes += parseInt(hourMatch[1], 10) * 60;
        }

        if (minMatch && minMatch[1]) {
            totalMinutes += parseInt(minMatch[1], 10);
        }

        // If no 'hr' or 'min' found, and it's just a number, assume it's minutes
        if (!hourMatch && !minMatch && /^\d+$/.test(durationStr)) {
            totalMinutes = parseInt(durationStr, 10);
        }
        
        // If after all parsing, totalMinutes is still 0 AND the original string wasn't just "0" or "0min" etc.
        // it might be an invalid format that didn't match hr/min and wasn't a plain number.
        // However, if it successfully parsed to 0 (e.g. "0hr 0min"), that's valid.
        if (totalMinutes === 0 && !/^(0|0hr|0h|0min|0m|0\s*hr\s*0\s*min)$/.test(durationStr.replace(/\s+/g, ''))) {
            // If string contains letters but didn't parse to anything, it's likely invalid
            if (/[a-zA-Z]/.test(durationStr)) return null;
        }


        return totalMinutes > 0 ? totalMinutes : (durationStr.startsWith("0") ? 0 : null); // Return null if parsing failed or result is not positive, unless it was explicitly "0"
    }

    // Helper function to format a duration in minutes to "X hr Y min" string
    function formatDurationFromMinutes(totalMinutes) {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
        return "0 min"; // Or handle error appropriately
    }
    if (totalMinutes === 0) {
        return "0 min";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let parts = [];
    if (hours > 0) {
        parts.push(`${hours} hr`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} min`);
    }

    // If totalMinutes was, for example, 120 (so 2hr 0min), parts would only have "2hr".
    // If parts is empty (e.g. totalMinutes was < 1 but not 0, which shouldn't happen with Math.floor for hours), default to 0 min
    if (parts.length === 0 && hours === 0 && minutes === 0) { // Should only happen if input was 0
        return "0 min";
    } else if (parts.length === 0 && hours > 0 && minutes === 0) { // e.g. 120 minutes -> 2hr
        return `${hours} hr`;
    }


    return parts.join(' ');
    }

    // Main scheduling algorithm using recursive backtracking
    function findMarathonSchedules(allMovies, numMoviesToSchedule, breakTimeMinutes, earliestStartMinutesGlobal) {
        const validSchedules = []; // This will store all found valid marathon combinations

        // Helper recursive function
        // currentSchedule: an array of movie slots { movieDetails, chosenShowtimeMinutes, title, durationMinutes }
        // usedMovieIndices: a Set to keep track of movies already in the currentSchedule to avoid duplicates
        // lastMovieEndTime: the end time (in minutes from midnight) of the last movie added to currentSchedule
        function findNextMovie(currentSchedule, usedMovieOriginalIndices, lastMovieEndTime) {
            // BASE CASE: If we've selected the desired number of movies, this is a valid schedule
            if (currentSchedule.length === numMoviesToSchedule) {
                validSchedules.push([...currentSchedule]); // Add a copy of the current schedule
                return;
            }

            // RECURSIVE STEP: Try to add another movie
            for (let i = 0; i < allMovies.length; i++) {
                const movie = allMovies[i];

                // Skip if this movie (by its original index) is already in the current schedule
                if (usedMovieOriginalIndices.has(movie.originalIndex)) {
                    continue;
                }

                for (const showtime of movie.showtimesInMinutes) {
                    let canScheduleThisShowtime = false;
                    let currentMovieStartTime = showtime;

                    if (currentSchedule.length === 0) { // This is the FIRST movie in the marathon
                        if (earliestStartMinutesGlobal !== null) {
                            if (currentMovieStartTime >= earliestStartMinutesGlobal) {
                                canScheduleThisShowtime = true;
                            }
                        } else {
                            // If no earliest start time, any showtime is fine for the first movie
                            canScheduleThisShowtime = true;
                        }
                    } else { // This is a SUBSEQUENT movie in the marathon
                        // Must start after the previous movie's end time + break time
                        if (currentMovieStartTime >= lastMovieEndTime + breakTimeMinutes) {
                            canScheduleThisShowtime = true;
                        }
                    }

                    if (canScheduleThisShowtime) {
                        // "Choose" this movie and showtime
                        currentSchedule.push({
                            title: movie.title,
                            durationMinutes: movie.durationMinutes,
                            chosenShowtimeMinutes: currentMovieStartTime,
                            // originalIndex: movie.originalIndex // Optional: if needed for debugging or complex logic
                        });
                        usedMovieOriginalIndices.add(movie.originalIndex);
                        const currentMovieNewEndTime = currentMovieStartTime + movie.durationMinutes;

                        // Recursively find the next movie
                        findNextMovie(currentSchedule, usedMovieOriginalIndices, currentMovieNewEndTime);

                        // "Unchoose" / BACKTRACK: remove the movie for the next iteration of the loop
                        currentSchedule.pop();
                        usedMovieOriginalIndices.delete(movie.originalIndex);
                    }
                }
            }
        }

        // Initial call to the recursive helper
        // Start with an empty schedule, empty set of used movies, and initial effective "last movie end time"
        // If earliestStartMinutesGlobal is set, that's our constraint for the first movie's start.
        // Otherwise, the first movie can start anytime, so we can use 0 or -Infinity conceptually.
        // For simplicity, the logic inside findNextMovie handles the first movie's earliestStart constraint.
        findNextMovie([], new Set(), 0); // Initial lastMovieEndTime can be 0 as the check handles it

        console.log("Found Schedules:", validSchedules);
        return validSchedules;
    }

    function displaySchedules(schedulesWithBreaks, minBreakPreference) {
        const scheduleResultsDiv = document.getElementById('scheduleResults');
        scheduleResultsDiv.innerHTML = '';

        if (!schedulesWithBreaks || schedulesWithBreaks.length === 0) {
            scheduleResultsDiv.innerHTML = '<p><em>No valid marathon schedules found with the given criteria. Try adjusting preferences or adding more movie showtimes.</em></p>';
            return;
        }

        const schedulesToDisplay = schedulesWithBreaks.slice(0, 5);
        let messageForMoreSchedules = "";
        if (schedulesWithBreaks.length > 5) {
            messageForMoreSchedules = `<p><em>Showing top 5 schedules out of ${schedulesWithBreaks.length} found.</em></p>`;
        }

        const ol = document.createElement('ol');
        ol.start = 1;

        schedulesToDisplay.forEach((scheduleData, index) => {
            const schedule = scheduleData.movies; // This is an array of movie slots
            const totalBreakTime = scheduleData.totalBreakTime;

            const scheduleLi = document.createElement('li'); // Main li for the whole marathon option
            let scheduleTitle = `<strong>Marathon Option ${index + 1}</strong> (Total Break Time: ${formatDurationFromMinutes(totalBreakTime)})`;
            if (schedule.length <= 1) {
                scheduleTitle = `<strong>Marathon Option ${index + 1}</strong>`;
                if (totalBreakTime === 0 && schedule.length > 1) {
                    scheduleTitle = `<strong>Marathon Option ${index + 1}</strong> (Total Break Time: 0 min)`;
                }
            }
            scheduleLi.innerHTML = scheduleTitle;
            
            const individualItemsUl = document.createElement('ul'); // Renamed for clarity
            individualItemsUl.style.listStyleType = "none"; // Remove default bullets for more control
            individualItemsUl.style.paddingLeft = "0"; // Remove default padding

            // Iterate through movies to display them and the breaks BETWEEN them
            schedule.forEach((slot, movieIndex) => {
                // --- Add Movie Item ---
                const movieLi = document.createElement('li');
                const startTime = minutesToTime(slot.chosenShowtimeMinutes);
                const endTime = minutesToTime(slot.chosenShowtimeMinutes + slot.durationMinutes);
                const movieDurationFormatted = formatDurationFromMinutes(slot.durationMinutes);
                
                movieLi.textContent = `${slot.title} (${movieDurationFormatted}): ${startTime} - ${endTime}`;
                individualItemsUl.appendChild(movieLi);

                // --- Add Break Item (if it's not the last movie) ---
                if (movieIndex < schedule.length - 1) {
                    const nextSlot = schedule[movieIndex + 1];
                    const actualBreakMinutes = nextSlot.chosenShowtimeMinutes - (slot.chosenShowtimeMinutes + slot.durationMinutes);
                    
                    const breakLi = document.createElement('li');
                    breakLi.classList.add('break-time-item'); // Add a class for styling
                    breakLi.innerHTML = `<span>--- Break: ${formatDurationFromMinutes(actualBreakMinutes)} ---</span>`;
                    individualItemsUl.appendChild(breakLi);
                }
            });
            scheduleLi.appendChild(individualItemsUl);
            ol.appendChild(scheduleLi);
        });

        scheduleResultsDiv.appendChild(ol);
        if (messageForMoreSchedules) {
            scheduleResultsDiv.insertAdjacentHTML('beforeend', messageForMoreSchedules);
        }
        console.log("Displayed Top Schedules (max 5, revised breaks):", schedulesToDisplay);
    }


    // We'll add the event listener for generateScheduleButton later
    const generateScheduleButton = document.getElementById('generateScheduleButton');
    generateScheduleButton.addEventListener('click', () => {
        scheduleResultsDiv.innerHTML = '<p><em>Generating schedules...</em></p>'; // Indicate processing

        // 1. Get user preferences
        const numMoviesToSchedule = parseInt(document.getElementById('numMovies').value, 10);
        const breakTimeMinutes = parseInt(document.getElementById('breakTime').value, 10);
        const earliestStartTimeRaw = document.getElementById('earliestStartTime').value;

        let earliestStartMinutes = null;
        if (earliestStartTimeRaw) {
            earliestStartMinutes = timeToMinutes(earliestStartTimeRaw);
            if (earliestStartMinutes === null) {
                alert('Invalid Earliest Start Time format. Please use HH:MM or leave blank.');
                scheduleResultsDiv.innerHTML = '<p><em>Error: Invalid earliest start time.</em></p>';
                return;
            }
        }

        // Basic validation for preferences
        if (isNaN(numMoviesToSchedule) || numMoviesToSchedule <= 0) {
            alert('Please enter a valid number of movies for the marathon.');
            scheduleResultsDiv.innerHTML = '<p><em>Error: Invalid number of movies.</em></p>';
            return;
        }
        if (isNaN(breakTimeMinutes) || breakTimeMinutes < 0) {
            alert('Please enter a valid break time (0 or more minutes).');
            scheduleResultsDiv.innerHTML = '<p><em>Error: Invalid break time.</em></p>';
            return;
        }
        if (moviesForMarathon.length === 0) {
            alert('Please add some movies before generating a schedule.');
            scheduleResultsDiv.innerHTML = '<p><em>Please add movies first.</em></p>';
            return;
        }
        if (numMoviesToSchedule > moviesForMarathon.length) {
            alert(`You want to schedule ${numMoviesToSchedule} movies, but have only added ${moviesForMarathon.length}. Please add more movies or reduce the number to schedule.`);
            scheduleResultsDiv.innerHTML = `<p><em>Not enough movies added for ${numMoviesToSchedule}-movie marathon.</em></p>`;
            return;
        }


        // 2. Prepare movie data with showtimes in minutes
        // We create a new array to avoid modifying the original moviesForMarathon if we re-generate
        const processedMovies = moviesForMarathon.map((movie, index) => {
            return {
                // Keep original index for reference if needed, or a unique ID
                originalIndex: index, // Could also generate a unique ID
                title: movie.title,
                durationMinutes: movie.durationMinutes,
                // Convert all showtime strings to minutes, filtering out any invalid ones
                showtimesInMinutes: movie.showtimes
                                        .map(st => timeToMinutes(st))
                                        .filter(stMin => stMin !== null)
                                        .sort((a, b) => a - b) // Sort showtimes numerically (earliest first)
            };
        }).filter(movie => movie.showtimesInMinutes.length > 0); // Only include movies with valid, converted showtimes

        if (processedMovies.length < numMoviesToSchedule) {
                alert(`After processing, only ${processedMovies.length} movies have valid showtimes, which is less than the ${numMoviesToSchedule} movies you want to schedule. Please check showtime formats.`);
            scheduleResultsDiv.innerHTML = `<p><em>Not enough movies with valid showtimes for ${numMoviesToSchedule}-movie marathon.</em></p>`;
            return;
        }


        console.log("Scheduling Preferences:", { numMoviesToSchedule, breakTimeMinutes, earliestStartMinutes });
        console.log("Processed Movies for Scheduling:", processedMovies);

    

    // 3. Call the main scheduling function
    let allSchedules = findMarathonSchedules(processedMovies, numMoviesToSchedule, breakTimeMinutes, earliestStartMinutes);

    // --- : Calculate cumulative break time for each schedule ---
    if (allSchedules && allSchedules.length > 0) {
        allSchedules = allSchedules.map(schedule => {
            let cumulativeBreak = 0;
            if (schedule.length > 1) { // Only calculate breaks if more than 1 movie
                for (let i = 0; i < schedule.length - 1; i++) {
                    const currentMovieEndTime = schedule[i].chosenShowtimeMinutes + schedule[i].durationMinutes;
                    const nextMovieStartTime = schedule[i+1].chosenShowtimeMinutes;
                    // The actual break between these two movies
                    const actualBreak = nextMovieStartTime - currentMovieEndTime;
                    cumulativeBreak += actualBreak;
                }
            }
            return {
                movies: schedule, // The original schedule array
                totalBreakTime: cumulativeBreak
            };
        });

        // --- Sort schedules by totalBreakTime (ascending) ---
        allSchedules.sort((a, b) => a.totalBreakTime - b.totalBreakTime);
    }
    // --- END OF  CALCULATION AND SORTING ---


    // 4. Display the results (we'll create a function for this too)
    displaySchedules(allSchedules, breakTimeMinutes); // Pass original breakTimeMinutes for context if needed



    });

}); // End of DOMContentLoaded




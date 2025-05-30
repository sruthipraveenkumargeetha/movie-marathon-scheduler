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
    let moviesForMarathon = []; // Each movie object will now have an 'id' and 'isMandatory' flag

    // --- MODIFIED: addMovieButton Event Listener ---
    addMovieButton.addEventListener('click', () => {
        // 1. Get the values from the input fields
        const title = movieTitleInput.value.trim();
        const durationStr = movieDurationInput.value;
        const duration = parseDurationToMinutes(durationStr);
        const showtimesRawInput = movieShowtimesInput.value;

        // Basic Validation
        if (!title) {
            alert('Please enter a movie title.');
            return;
        }
        // Allow duration of 0 (e.g. short film / intermission placeholder)
        if (duration === null || duration < 0) {
            alert('Please enter a valid movie duration (e.g., 1hr 30min, 90min, or 90). Duration can be 0 for shorts/intermissions.');
            return;
        }
        if (!showtimesRawInput.trim()) {
            alert('Please enter at least one showtime.');
            return;
        }

        // 2. Process showtimes
        const showtimesArray = parseAdvancedShowtimesInput(showtimesRawInput);

        // Check if parseAdvancedShowtimesInput returned valid times
        if (showtimesArray.length === 0 && showtimesRawInput.trim() !== "") {
             alert('No valid showtimes found from the input. Please use HH:MM format, optionally with AM/PM, on separate lines or extractable.');
             return;
        } else if (showtimesArray.length === 0) { // If input was empty AND no times found (already caught by trim check)
            alert('Please enter valid showtimes.');
            return;
        }


        // 3. Create a movie object
        const newMovie = {
            id: Date.now(), // --- NEW: Unique ID for each movie ---
            title: title,
            durationMinutes: duration,
            showtimes: showtimesArray,
            isMandatory: false // --- NEW: Default to not mandatory ---
        };

        // 4. Add the new movie object to our array
        moviesForMarathon.push(newMovie);

        // 5. Update the display of added movies
        renderAddedMovies();

        // 6. Clear the input fields
        movieTitleInput.value = '';
        movieDurationInput.value = '';
        movieShowtimesInput.value = '';
        movieTitleInput.focus();

        console.log('Current moviesForMarathon:', moviesForMarathon);
    });

    // --- MODIFIED: renderAddedMovies Function ---
    function renderAddedMovies() {
        addedMoviesList.innerHTML = '';

        if (moviesForMarathon.length === 0) {
            addedMoviesList.innerHTML = '<li><em>No movies added yet.</em></li>';
            return;
        }

        moviesForMarathon.forEach((movie) => { // Removed 'index' as it's not directly used for display text now
            const listItem = document.createElement('li');
            listItem.dataset.movieId = movie.id; // Store movie ID for easy access

            // --- NEW: Checkbox for mandatory status ---
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = movie.isMandatory;
            checkbox.title = "Mark as mandatory for marathon";
            checkbox.style.marginRight = '10px'; // Basic styling
            checkbox.addEventListener('change', (event) => {
                // Find movie by ID (safer than index if list order changes or items are removed)
                const movieToUpdate = moviesForMarathon.find(m => m.id === movie.id);
                if (movieToUpdate) {
                    movieToUpdate.isMandatory = event.target.checked;
                    console.log("Updated mandatory status:", movieToUpdate);
                }
            });

            const durationFormatted = formatDurationFromMinutes(movie.durationMinutes);
            const textNode = document.createTextNode(
                `${movie.title} (${durationFormatted}) - Showtimes: ${movie.showtimes.join(', ')}`
            );

            listItem.appendChild(checkbox); // Add checkbox first
            listItem.appendChild(textNode);  // Then the movie text
            addedMoviesList.appendChild(listItem);
        });
    }


    // Helper function to convert "HH:MM" string to minutes since midnight
    function timeToMinutes(timeStr) {
        if (!timeStr || !timeStr.includes(':')) {
            // console.error("Invalid time string format:", timeStr); // Keep console for debugging
            return null;
        }
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            // console.error("Invalid time values in string:", timeStr);
            return null;
        }
        return hours * 60 + minutes;
    }

    // Helper function to convert minutes since midnight back to "HH:MM" string
    function minutesToTime(totalMinutes) {
        if (isNaN(totalMinutes) || totalMinutes < 0) {
            // console.error("Invalid total minutes:", totalMinutes);
            return "00:00"; // Fallback for display
        }
        const hours = Math.floor(totalMinutes / 60) % 24; // Ensure hours wrap around for overnight schedules
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Helper function to parse various duration string formats to total minutes
    function parseDurationToMinutes(durationStr) {
        if (!durationStr) return null;
        durationStr = String(durationStr).toLowerCase().trim();

        let totalMinutes = 0;
        let foundMatch = false; // Flag to see if any format was matched

        // Regex for "Xhr Ymin", "Xh Ym", "Xhr", "Xh", "Ymin", "Ym"
        const hourMatch = durationStr.match(/(\d+)\s*(?:hr|h)/);
        const minMatch = durationStr.match(/(\d+)\s*(?:min|m)/);

        if (hourMatch && hourMatch[1]) {
            totalMinutes += parseInt(hourMatch[1], 10) * 60;
            foundMatch = true;
        }

        if (minMatch && minMatch[1]) {
            totalMinutes += parseInt(minMatch[1], 10);
            foundMatch = true;
        }

        // If no specific 'hr' or 'min' unit found, but it's just a number, assume it's minutes
        if (!foundMatch && /^\d+$/.test(durationStr)) {
            totalMinutes = parseInt(durationStr, 10);
            foundMatch = true;
        }
        
        // If we found a match (either units or plain number), return the result
        // This allows "0", "0min", "0hr 0min" to correctly parse to 0.
        if (foundMatch) {
            return totalMinutes;
        }

        // If no format matched at all, it's invalid
        return null;
    }


    // Helper function to format a duration in minutes to "X hr Y min" string
    function formatDurationFromMinutes(totalMinutes) {
        if (isNaN(totalMinutes) || totalMinutes < 0) {
            return "0 min";
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
        
        if (parts.length === 0) { // This case should only be hit if totalMinutes was 0, and we have a check
             if (hours > 0) return `${hours} hr`; // e.g. 60 minutes -> 1hr 0min -> "1 hr"
             if (minutes > 0) return `${minutes} min`; // e.g. 30 minutes -> 0hr 30min -> "30 min"
             return "0 min"; // Fallback for safety, though earlier checks should cover 0.
        }

        return parts.join(' ');
    }

    // Helper function to parse raw text input for showtimes
    function parseAdvancedShowtimesInput(rawText) {
        if (!rawText || typeof rawText !== 'string') {
            return [];
        }
        const extractedTimes = [];
        const lines = rawText.split('\n');
        const timeRegex = /(\d{1,2}):(\d{2})\s*(am|pm)?/ig;

        for (const line of lines) {
            let match;
            timeRegex.lastIndex = 0;
            while ((match = timeRegex.exec(line)) !== null) {
                let hours = parseInt(match[1], 10);
                let minutes = parseInt(match[2], 10);
                const ampm = match[3] ? match[3].toLowerCase() : null;

                if (isNaN(hours) || isNaN(minutes)) {
                    console.warn(`Invalid time numbers found in: "${line}"`);
                    continue;
                }
                if (ampm) {
                    if (hours < 1 || hours > 12) {
                        console.warn(`Invalid hour (${hours}) for AM/PM time in: "${line}"`);
                        continue;
                    }
                    if (ampm === 'pm' && hours < 12) hours += 12;
                    else if (ampm === 'am' && hours === 12) hours = 0;
                }
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    if (!extractedTimes.includes(formattedTime)) {
                        extractedTimes.push(formattedTime);
                    }
                } else {
                    console.warn(`Time out of valid 24-hour range after conversion: ${hours}:${minutes} from "${line}"`);
                }
            }
        }
        return extractedTimes.sort();
    }

    // --- MODIFIED: findMarathonSchedules Function ---
    function findMarathonSchedules(allMovies, numMoviesToSchedule, breakTimeMinutes, earliestStartMinutesGlobal, mandatoryMovieIds) {
        const validSchedules = [];

        function findNextMovie(currentSchedule, usedMovieOriginalIds, lastMovieEndTime) {
            // BASE CASE: If we've selected the desired number of movies
            if (currentSchedule.length === numMoviesToSchedule) {
                // --- NEW: AND all mandatory movies are included ---
                const currentScheduleMovieOriginalIds = currentSchedule.map(slot => slot.originalId);
                const allMandatoryPresent = mandatoryMovieIds.every(id => currentScheduleMovieOriginalIds.includes(id));

                if (allMandatoryPresent) {
                    validSchedules.push([...currentSchedule]);
                }
                return;
            }

            // --- NEW: Pruning if not enough slots for remaining mandatory movies ---
            const mandatoryMoviesInCurrentScheduleCount = currentSchedule.filter(slot => mandatoryMovieIds.includes(slot.originalId)).length;
            const mandatoryMoviesStillNeeded = mandatoryMovieIds.length - mandatoryMoviesInCurrentScheduleCount;
            if (numMoviesToSchedule - currentSchedule.length < mandatoryMoviesStillNeeded) {
                return; // Not enough remaining slots to fit the rest of the mandatory movies
            }

            // RECURSIVE STEP
            for (let i = 0; i < allMovies.length; i++) {
                const movie = allMovies[i]; // 'movie' here is an object from 'processedMovies'
                                            // It has 'originalId' which corresponds to movie.id from moviesForMarathon

                if (usedMovieOriginalIds.has(movie.originalId)) {
                    continue;
                }

                for (const showtime of movie.showtimesInMinutes) {
                    let canScheduleThisShowtime = false;
                    let currentMovieStartTime = showtime;

                    if (currentSchedule.length === 0) {
                        if (earliestStartMinutesGlobal !== null) {
                            if (currentMovieStartTime >= earliestStartMinutesGlobal) canScheduleThisShowtime = true;
                        } else canScheduleThisShowtime = true;
                    } else {
                        if (currentMovieStartTime >= lastMovieEndTime + breakTimeMinutes) canScheduleThisShowtime = true;
                    }

                    if (canScheduleThisShowtime) {
                        currentSchedule.push({
                            title: movie.title,
                            durationMinutes: movie.durationMinutes,
                            chosenShowtimeMinutes: currentMovieStartTime,
                            originalId: movie.originalId // Ensure originalId is carried through
                        });
                        usedMovieOriginalIds.add(movie.originalId);
                        const currentMovieNewEndTime = currentMovieStartTime + movie.durationMinutes;

                        findNextMovie(currentSchedule, usedMovieOriginalIds, currentMovieNewEndTime);

                        currentSchedule.pop();
                        usedMovieOriginalIds.delete(movie.originalId);
                    }
                }
            }
        }

        findNextMovie([], new Set(), 0);
        console.log("Found Schedules (considering mandatory):", validSchedules);
        return validSchedules;
    }

    // --- MODIFIED: displaySchedules Function ---
    function displaySchedules(schedulesWithBreaks, mandatoryMoviesWereAttempted) { // Added new parameter
        scheduleResultsDiv.innerHTML = '';

        if (!schedulesWithBreaks || schedulesWithBreaks.length === 0) {
            // --- NEW: Customized message for mandatory movies ---
            let message = 'No valid marathon schedules found with the given criteria. Try adjusting preferences or adding more movie showtimes.';
            if (mandatoryMoviesWereAttempted) {
                message = 'No valid marathon schedules found that include all your mandatory movies with the given constraints. Try different showtimes, adjust break times, change which movies are mandatory, or ensure mandatory movies have valid showtimes.';
            }
            scheduleResultsDiv.innerHTML = `<p><em>${message}</em></p>`;
            return;
        }

        // Limit to top 5 (or 6 based on your previous slice)
        const schedulesToDisplay = schedulesWithBreaks.slice(0, 5); // Consistent with original intent of top 5
        let messageForMoreSchedules = "";
        if (schedulesWithBreaks.length > 5) {
            messageForMoreSchedules = `<p><em>Showing top 5 schedules out of ${schedulesWithBreaks.length} found.</em></p>`;
        }

        const ol = document.createElement('ol');
        // ol.start = 1; // Not strictly needed if CSS handles numbering/appearance

        schedulesToDisplay.forEach((scheduleData, index) => {
            const schedule = scheduleData.movies;
            const totalBreakTime = scheduleData.totalBreakTime;
            const scheduleLi = document.createElement('li');
            
            let scheduleTitleText = `Marathon Option ${index + 1}`;
            if (schedule.length > 1 || totalBreakTime > 0) {
                 scheduleTitleText += ` (Total Break: ${formatDurationFromMinutes(totalBreakTime)})`;
            }
            const strongTitle = document.createElement('strong');
            strongTitle.innerHTML = scheduleTitleText; // Use innerHTML if title might contain HTML entities from movie titles
            scheduleLi.appendChild(strongTitle);
            
            const individualItemsUl = document.createElement('ul');
            // CSS should handle list-style-type and padding for ul inside #scheduleResults ol > li ul
            // individualItemsUl.style.listStyleType = "none";
            // individualItemsUl.style.paddingLeft = "0";

            schedule.forEach((slot, movieIndex) => {
                const movieLi = document.createElement('li');
                const startTime = minutesToTime(slot.chosenShowtimeMinutes);
                const endTime = minutesToTime(slot.chosenShowtimeMinutes + slot.durationMinutes);
                const movieDurationFormatted = formatDurationFromMinutes(slot.durationMinutes);
                movieLi.textContent = `${slot.title} (${movieDurationFormatted}): ${startTime} - ${endTime}`;
                individualItemsUl.appendChild(movieLi);

                if (movieIndex < schedule.length - 1) {
                    const nextSlot = schedule[movieIndex + 1];
                    const actualBreakMinutes = nextSlot.chosenShowtimeMinutes - (slot.chosenShowtimeMinutes + slot.durationMinutes);
                    const breakLi = document.createElement('li');
                    breakLi.classList.add('break-time-item');
                    breakLi.textContent = `--- Break: ${formatDurationFromMinutes(actualBreakMinutes)} ---`;
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
        // console.log("Displayed Top Schedules (max 5, revised breaks):", schedulesToDisplay);
    }


    // --- MODIFIED: generateScheduleButton Event Listener ---
    const generateScheduleButton = document.getElementById('generateScheduleButton');
    generateScheduleButton.addEventListener('click', () => {
        scheduleResultsDiv.innerHTML = '<p><em>Generating schedules...</em></p>';

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

        // --- NEW: Get Mandatory Movies ---
        const mandatoryMovies = moviesForMarathon.filter(movie => movie.isMandatory);
        const mandatoryMovieIds = mandatoryMovies.map(movie => movie.id); // Use the unique ID

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
        // --- NEW: Validation for mandatory movies count ---
        if (numMoviesToSchedule < mandatoryMovies.length) {
            alert(`You want to schedule ${numMoviesToSchedule} movies, but have marked ${mandatoryMovies.length} as mandatory. Please adjust your selection or the number of movies to schedule.`);
            scheduleResultsDiv.innerHTML = `<p><em>Cannot schedule: Number of movies is less than mandatory movies selected.</em></p>`;
            return;
        }
        if (numMoviesToSchedule > moviesForMarathon.length) {
            alert(`You want to schedule ${numMoviesToSchedule} movies, but have only added ${moviesForMarathon.length}. Please add more movies or reduce the number to schedule.`);
            scheduleResultsDiv.innerHTML = `<p><em>Not enough movies added for ${numMoviesToSchedule}-movie marathon.</em></p>`;
            return;
        }

        // 2. Prepare movie data
        // --- MODIFIED: Ensure originalId matches the movie.id used for mandatory checks ---
        const processedMovies = moviesForMarathon.map(movie => {
            return {
                originalId: movie.id, // Use the unique movie.id as originalId
                title: movie.title,
                durationMinutes: movie.durationMinutes,
                showtimesInMinutes: movie.showtimes
                    .map(st => timeToMinutes(st))
                    .filter(stMin => stMin !== null)
                    .sort((a, b) => a - b)
            };
        }).filter(movie => movie.showtimesInMinutes.length > 0); // Only include movies with valid showtimes

        // --- NEW: Check if mandatory movies still have valid showtimes after processing ---
        const mandatoryMoviesWithValidShowtimes = processedMovies.filter(pm => mandatoryMovieIds.includes(pm.originalId));
        if (mandatoryMoviesWithValidShowtimes.length < mandatoryMovies.length) {
             alert('Some mandatory movies do not have valid showtimes after processing. Please check their showtime entries.');
             scheduleResultsDiv.innerHTML = '<p><em>Error: One or more mandatory movies lack valid showtimes. Cannot generate schedule.</em></p>';
             return;
        }

        if (processedMovies.length < numMoviesToSchedule && numMoviesToSchedule > 0) {
            alert(`After processing, only ${processedMovies.length} movies have valid showtimes. This might not be enough for your ${numMoviesToSchedule}-movie marathon, especially with mandatory movies. Please check showtime formats or adjust preferences.`);
            // Do not return here; let the algorithm try, it will report if no valid schedules are found.
        }
         if (processedMovies.length === 0 && numMoviesToSchedule > 0) { // Case where NO movies have valid showtimes
            alert('No movies with valid showtimes available to schedule.');
            scheduleResultsDiv.innerHTML = '<p><em>No movies with valid showtimes found.</em></p>';
            return;
        }


        console.log("Scheduling Preferences:", { numMoviesToSchedule, breakTimeMinutes, earliestStartMinutes });
        console.log("Processed Movies for Scheduling:", processedMovies);
        console.log("Mandatory Movie IDs for Scheduling:", mandatoryMovieIds);


        // 3. Call the main scheduling function
        let allSchedules = findMarathonSchedules(
            processedMovies,
            numMoviesToSchedule,
            breakTimeMinutes,
            earliestStartMinutes,
            mandatoryMovieIds // --- NEW: Pass mandatory IDs ---
        );

        // --- Calculate cumulative break time for each schedule ---
        if (allSchedules && allSchedules.length > 0) {
            allSchedules = allSchedules.map(schedule => {
                let cumulativeBreak = 0;
                if (schedule.length > 1) {
                    for (let i = 0; i < schedule.length - 1; i++) {
                        const currentMovieEndTime = schedule[i].chosenShowtimeMinutes + schedule[i].durationMinutes;
                        const nextMovieStartTime = schedule[i + 1].chosenShowtimeMinutes;
                        const actualBreak = nextMovieStartTime - currentMovieEndTime;
                        cumulativeBreak += actualBreak;
                    }
                }
                return {
                    movies: schedule,
                    totalBreakTime: cumulativeBreak
                };
            });
            allSchedules.sort((a, b) => a.totalBreakTime - b.totalBreakTime);
        }

        // 4. Display the results
        // --- MODIFIED: Pass boolean indicating if mandatory movies were part of the attempt ---
        displaySchedules(allSchedules, mandatoryMovieIds.length > 0);
    });

}); // End of DOMContentLoaded
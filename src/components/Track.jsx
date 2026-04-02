// Track router — picks the right track for each lesson and free-drive level
import Track1 from "./Track1";        // Forest (free drive)
import Track2 from "./Track2";        // Desert Speedway (free drive)
import Track3 from "./Track3";        // Night City (free drive)
import HighwayTrack from "./HighwayTrack";  // Lesson 6 highway
import TrackLesson1 from "./TrackLesson1";  // Lesson 1: Starting the Car
import TrackLesson2 from "./TrackLesson2";  // Lesson 2: Moving & Stopping
import TrackLesson3 from "./TrackLesson3";  // Lesson 3: Changing Gears
import TrackLesson4 from "./TrackLesson4";  // Lesson 4: Emergency Braking
import TrackLesson5 from "./TrackLesson5";  // Lesson 5: Parking
import TrackLesson7 from "./TrackLesson7";  // Lesson 7: Roundabout
import TrackLesson8 from "./TrackLesson8";  // Lesson 8: Hill Start
import TrackLesson9 from "./TrackLesson9";  // Lesson 9: Slalom

const Track = ({ levelId = "lesson1" }) => {
  switch (levelId) {
    case "lesson1": return <TrackLesson1 />;
    case "lesson2": return <TrackLesson2 />;
    case "lesson3": return <TrackLesson3 />;
    case "lesson4": return <TrackLesson4 />;
    case "lesson5": return <TrackLesson5 />;
    case "lesson6": return <HighwayTrack />;
    case "lesson7": return <TrackLesson7 />;
    case "lesson8": return <TrackLesson8 />;
    case "lesson9": return <TrackLesson9 />;
    // Free drive tracks
    case "track2": return <Track2 />;
    case "track3": return <Track3 />;
    default: return <Track1 />;
  }
};

export default Track;
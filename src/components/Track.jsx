import Track1 from "./Track1";
import HighwayTrack from "./HighwayTrack";
import TrackLesson1 from "./TrackLesson1";
import TrackLesson2 from "./TrackLesson2";
import TrackLesson3 from "./TrackLesson3";
import TrackLesson4 from "./TrackLesson4";
import TrackLesson5 from "./TrackLesson5";
import TrackLesson7 from "./TrackLesson7";
import TrackLesson8 from "./TrackLesson8";
import TrackLesson9 from "./TrackLesson9";
import TrackPlane1 from "./TrackPlane1";
import TrackPlane2 from "./TrackPlane2";
import TrackPlane3 from "./TrackPlane3";
import TrackPlane4 from "./TrackPlane4";
import TrackHelicopter1 from "./TrackHelicopter1";
import TrackHelicopter2 from "./TrackHelicopter2";

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

    case "plane1":  return <TrackPlane1 />;
    case "plane2":  return <TrackPlane2 />;
    case "plane3":  return <TrackPlane3 />;
    case "plane4":  return <TrackPlane4 />;

    case "heli1":   return <TrackHelicopter1 />;
    case "heli2":   return <TrackHelicopter2 />;

    default:        return <Track1 />;
  }
};

export default Track;
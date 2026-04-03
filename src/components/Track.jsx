import TrackLesson9 from "./TrackLesson9";

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
    case "track2": return <Track2 />;
    case "track3": return <Track3 />;
    case "track4": return <Track4 />;
    case "track5": return <Track5 />;
    default:        return <Track1 />;
  }
};

export default Track;
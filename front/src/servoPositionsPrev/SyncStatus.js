import done from "../assets/icons/done.png";
import inProgress from "../assets/icons/in-progress.png";
import notDone from "../assets/icons/not-done.png";

export function SyncStatus({ status }) {
  const result = (
    <div className="sync-status">
      <img className="sync-status-icon" src={notDone} />
      <label className="sync-status-info">not synchronized</label>
    </div>
  );
  return result;
}

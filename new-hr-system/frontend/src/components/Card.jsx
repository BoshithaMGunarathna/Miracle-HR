const Card = ({ data, onApprove, onReject }) => {
  return (
    <div className="border rounded-lg p-4 shadow-lg mb-4 text-center">
      <h3 className="text-lg font-bold mb-2">{data.name}</h3>
      <br />
      <div className="leading-9">
  <p>
    <span className="font-semibold text-gray-800">
      Old Leave Dates:
    </span>{" "}
    <span className="text-gray-500">{data.old_first_day} to {data.old_last_day}</span>
    
  </p>
  <p>
    <span className="font-semibold text-gray-800">
      New Leave Dates:
    </span>{" "}
    <span className="text-gray-500">{data.first_day} to {data.last_day}</span>
  </p>
  <p>
    <span className="font-semibold text-gray-800">
      Previous Leave Type:
    </span>{" "}
    <span className="text-gray-500">{data.old_leave_type}</span>
  </p>
  <p>
    <span className="font-semibold text-gray-800">
      New Leave Type:
    </span>{" "}
    <span className="text-gray-500">{data.leave_type}</span>
  </p>
  <p>
    <span className="font-semibold text-gray-800">
      Previous Reason:
    </span>{" "}
    <span className="text-gray-500">{data.old_reason}</span>
  </p>
  <p>
    <span className="font-semibold text-gray-800">
      New Reason:
    </span>{" "}
    <span className="text-gray-500">{data.reason}</span>
  </p>

  <p>
    <span className="font-semibold text-gray-800">
      Previous Representative:
    </span>{" "}
    <span className="text-gray-500">{data.old_representative}</span>
  </p>
  <p>
    <span className="font-semibold text-gray-800">
      New Representative:
    </span>{" "}
    <span className="text-gray-500">{data.representative}</span>
  </p>
</div>


      <div className="flex justify-center mt-4 space-x-4">
        <button
          style={{
            backgroundColor: "#218838",
            color: "#fff",
          }}
          className="px-4 py-2 rounded hover:opacity-90"
          onClick={() => onApprove(data)}
        >
          Approve
        </button>
        <button
          style={{
            backgroundColor: "#c82333",
            color: "#fff",
          }}
          className="px-4 py-2 rounded hover:opacity-90"
          onClick={() => onReject(data)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Card;

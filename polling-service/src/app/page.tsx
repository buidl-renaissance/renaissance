export default function Home() {
  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Renaissance Event Polling Service</h1>
      <p>
        This service polls multiple event sources and ingests events into the 
        Renaissance app database.
      </p>
      
      <h2>API Endpoints</h2>
      <ul>
        <li>
          <code>GET /api/health</code> - Health check and configuration status
        </li>
        <li>
          <code>GET /api/poll/all</code> - Poll all event sources
        </li>
        <li>
          <code>GET /api/poll/luma</code> - Poll Luma events
        </li>
        <li>
          <code>GET /api/poll/ra</code> - Poll Resident Advisor events
        </li>
        <li>
          <code>GET /api/poll/meetup</code> - Poll Meetup events
        </li>
      </ul>

      <h2>Cron Schedule</h2>
      <ul>
        <li><code>/api/poll/all</code> - Every 4 hours</li>
        <li><code>/api/poll/luma</code> - Every 6 hours at :15</li>
        <li><code>/api/poll/ra</code> - Every 6 hours at :30</li>
        <li><code>/api/poll/meetup</code> - Every 6 hours at :45</li>
      </ul>

      <h2>Source Code</h2>
      <p>
        <a href="https://github.com/buidl-renaissance/renaissance/tree/main/polling-service">
          View on GitHub
        </a>
      </p>
    </main>
  );
}

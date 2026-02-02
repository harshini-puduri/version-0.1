// Script to add sample journal entries to the database via API
const API_URL = 'https://journal-backend-api.fly.dev/api';

const sampleEntries = [
  {
    title: "A Beautiful Morning",
    content: "Woke up to the sound of birds chirping outside my window. The sunrise was absolutely breathtaking today. I made myself a cup of coffee and sat by the window, just taking in the moment. These quiet mornings remind me to appreciate the simple things in life."
  },
  {
    title: "Great Day at Work",
    content: "Finally finished that project I've been working on for weeks! The team loved the presentation and we celebrated with lunch. Feeling accomplished and grateful for my supportive colleagues. Sometimes hard work really does pay off!"
  },
  {
    title: "Evening Reflections",
    content: "Spent the evening thinking about where I want to be in five years. It's interesting how our goals evolve over time. I'm learning to be more patient with myself and trust the journey. Growth isn't linear, and that's okay."
  },
  {
    title: "Busy Week Ahead",
    content: "So many deadlines coming up this week. Trying to stay organized and not let the stress get to me. Made a detailed to-do list and scheduled some breaks to recharge. I can do this, just need to take it one day at a time."
  },
  {
    title: "Coffee Shop Vibes",
    content: "Found a cute new coffee shop downtown. The atmosphere is perfect for journaling. Met an interesting person who recommended a book I need to check out. Days like these remind me why I love exploring my city."
  },
  {
    title: "Rainy Day Thoughts",
    content: "There's something soothing about rain. Spent the day indoors reading and listening to music. No plans, no pressure, just being present. These slow days are necessary for recharging my batteries."
  }
];

async function addSampleData() {
  console.log('Adding sample entries to database...\n');
  
  for (const entry of sampleEntries) {
    try {
      const response = await fetch(`${API_URL}/entries?user_id=demo_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Created: "${entry.title}" (ID: ${data.id})`);
      } else {
        const error = await response.text();
        console.error(`✗ Failed to create "${entry.title}": ${error}`);
      }
    } catch (error) {
      console.error(`✗ Error creating "${entry.title}":`, error.message);
    }
  }
  
  console.log('\n✓ Done! Run the script again to verify entries:');
  console.log(`  curl ${API_URL}/entries`);
}

addSampleData();

export const getRandomEmptyMessage = (type) => {
  const messages = {
    items: [
      "Looks like it's empty here! Why not be the first to list a component?",
      "It's a bit quiet in here... Time to start browsing!",
      "Nothing to see here right now. Check back later!",
      "A clean slate! Try adjusting your search filters or posting something new."
    ],
    messages: [
      "No messages yet! Start a conversation to get things going.",
      "Your inbox is empty. Browse the marketplace and connect with a seller!",
      "It's quiet in here... Reach out to someone and make a deal!",
      "No active chats found. Time to discover some new hardware!"
    ]
  };

  const list = messages[type] || messages.items;
  return list[Math.floor(Math.random() * list.length)];
};

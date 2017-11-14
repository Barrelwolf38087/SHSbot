module.exports = client => {
  client.on("messageReactionAdd", (reaction, user) => {
    console.log("Removing reaction " + reaction.emoji.identifier, reaction.emoji.name + " of " + user.tag + ":" + user.id);
    if(reaction.emoji.toString().codePointAt().toString(16) === "1f346" && !reaction.message.channel.guild.members.get(user.id).hasPermission("ADMINISTRATOR")){
    console.log("remove");
      reaction.remove(user).catch(console.error);
    }
  });
};

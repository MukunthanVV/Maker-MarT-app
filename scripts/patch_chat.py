import sys

with open("src/pages/EngineerChat.jsx", "r") as f:
    content = f.read()

# Imports
content = content.replace("import { isProfileComplete } from '../utils/profileUtils';", "import { isProfileComplete } from '../utils/profileUtils';\nimport EmojiPicker from 'emoji-picker-react';")

# State
state_target = """  const [loading, setLoading] = useState(true);\n  const messagesEndRef = React.useRef(null);"""
state_repl = """  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = React.useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      const { error } = await supabase.from('messages').delete().eq('chat_id', chatId);
      if (!error) {
        setMessages([]);
      }
      setShowMenu(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataUpload
      });
      const data = await res.json();
      if (data.secure_url) {
        const { error } = await supabase.from('messages').insert([{
          chat_id: chatId,
          sender_id: currentUserId,
          content: data.secure_url
        }]);
        if (error) throw error;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };
"""
content = content.replace(state_target, state_repl)

# 3 dots menu
menu_target = """<button className="hover:bg-surface-container-low transition-colors p-base rounded-full cursor-pointer active:opacity-80">
<span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
</button>"""
menu_repl = """<div className="relative">
  <button onClick={() => setShowMenu(!showMenu)} className="hover:bg-surface-container-low transition-colors p-base rounded-full cursor-pointer active:opacity-80">
    <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
  </button>
  {showMenu && (
    <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-md shadow-lg border border-outline-variant z-50">
      <button onClick={handleClearHistory} className="w-full text-left px-4 py-2 text-error hover:bg-surface-container transition-colors rounded-md font-body-md">
        Clear Chat History
      </button>
    </div>
  )}
</div>"""
content = content.replace(menu_target, menu_repl)

# message render
msg_is_me_target = """<div className="bg-primary-container text-on-primary-container p-md rounded-xl rounded-tr-none border border-primary shadow-sm">
      <p className="font-body-md whitespace-pre-wrap">{msg.content}</p>
      </div>"""
msg_is_me_repl = """<div className="bg-primary-container text-on-primary-container p-md rounded-xl rounded-tr-none border border-primary shadow-sm">
      {msg.content.startsWith('http') && msg.content.includes('res.cloudinary.com') ? (
         <img src={msg.content} alt="Uploaded" className="max-w-full rounded-lg" />
      ) : (
         <p className="font-body-md whitespace-pre-wrap">{msg.content}</p>
      )}
      </div>"""
content = content.replace(msg_is_me_target, msg_is_me_repl)

msg_other_target = """<div className="bg-surface-container-lowest text-on-surface p-md rounded-xl rounded-tl-none border border-outline-variant">
      <p className="font-body-md whitespace-pre-wrap">{msg.content}</p>
      </div>"""
msg_other_repl = """<div className="bg-surface-container-lowest text-on-surface p-md rounded-xl rounded-tl-none border border-outline-variant">
      {msg.content.startsWith('http') && msg.content.includes('res.cloudinary.com') ? (
         <img src={msg.content} alt="Uploaded" className="max-w-full rounded-lg" />
      ) : (
         <p className="font-body-md whitespace-pre-wrap">{msg.content}</p>
      )}
      </div>"""
content = content.replace(msg_other_target, msg_other_repl)

# Input bar
input_target = """<button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high border border-outline-variant text-primary transition-all active:scale-95">
<span className="material-symbols-outlined">add</span>
</button>"""
input_repl = """<button onClick={() => fileInputRef.current.click()} disabled={uploadingImage} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high border border-outline-variant text-primary transition-all active:scale-95">
<span className="material-symbols-outlined">{uploadingImage ? 'hourglass_empty' : 'add'}</span>
</button>
<input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />"""
content = content.replace(input_target, input_repl)

emoji_target = """<div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-sm">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">sentiment_satisfied</span>
</div>"""
emoji_repl = """<div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-sm">
<span onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">sentiment_satisfied</span>
</div>
{showEmojiPicker && (
  <div className="absolute bottom-full right-0 mb-2">
    <EmojiPicker onEmojiClick={onEmojiClick} />
  </div>
)}"""
content = content.replace(emoji_target, emoji_repl)

with open("src/pages/EngineerChat.jsx", "w") as f:
    f.write(content)

print("EngineerChat updated.")

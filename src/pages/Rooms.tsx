import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Lock, Globe, Plus, Users, Search, Hash, Send, Smile } from 'lucide-react';
import { Card, Button, Input, Badge, Modal, EmptyState } from '@/components/ui';
import { useRoomStore } from '@/store/useDataStores';
import { useAuthStore } from '@/store/useAuthStore';
import EmojiPicker from 'emoji-picker-react';
import { SmilePlus } from 'lucide-react';

const Rooms: React.FC = () => {
  const { user } = useAuthStore();
  const {
  rooms,
  createRoom,
  fetchRooms,
  joinRoom,
  sendMessage,
  fetchMessages,
  messages,
  subscribeToRoom,
} = useRoomStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
  fetchRooms();
}, []);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', type: 'public', password: '', category: '' });
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  
  
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  const handleCreateRoom = async () => {
  if (!roomName.trim()) return;

  setCreating(true);

  const result = await createRoom({
    name: roomName,
    description: '',
    type: 'public',
    is_active: true,
  });

  setCreating(false);

  if (result.error) {
    console.error(result.error);
    alert(result.error);
    return;
  }

  setRoomName('');

  await fetchRooms();

  alert('Комната создана');
};
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Комнаты</h1>
          <p className="text-slate-400 text-sm">Общайтесь, играйте и учитесь вместе</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
          Создать комнату
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room list */}
        <div className="lg:col-span-1 space-y-4">
          <Input
            placeholder="Поиск комнат..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {filteredRooms.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-12 h-12" />}
              title="Нет комнат"
              description="Создайте первую комнату или дождитесь подключения к Supabase"
              action={<Button size="sm" onClick={() => setCreateOpen(true)}>Создать комнату</Button>}
            />
          ) : (
            <div className="space-y-2">
              {filteredRooms.map((room, i) => (
                <motion.div key={room.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    hover
                    padding="sm"
                    className={selectedRoom === room.id ? 'border-indigo-500/50 bg-indigo-500/10' : ''}
                    onClick={async () => {
  const result = await joinRoom(room.id);

  if (
    result.error &&
    !result.error.includes('duplicate key')
  ) {
    alert(result.error);
    return;
  }

  setSelectedRoom(room.id);

  await fetchMessages(room.id);

  subscribeToRoom(room.id);
}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {room.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{room.name}</h3>
                          {room.type === 'private' && <Lock className="w-3 h-3 text-amber-400" />}
                          {room.type === 'password' && <Lock className="w-3 h-3 text-red-400" />}
                          {room.type === 'public' && <Globe className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">{room.online_count || 0} online</span>
                          {room.category && (
                            <Badge variant="info" className="text-[10px]">
                              <Hash className="w-2.5 h-2.5 mr-0.5" />
                              {room.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <Card padding="none" className="h-[600px] flex flex-col">
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    К
                  </div>
                  <div>
                    <h3 className="font-semibold">
  {rooms.find((r) => r.id === selectedRoom)?.name || 'Комната'}
</h3>

<p className="text-xs text-slate-400">
  {rooms.find((r) => r.id === selectedRoom)?.online_count || 0} участников
</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Online</Badge>
                </div>
              </div>

              {/* Messages */}
<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f172a]">
  {messages.length === 0 ? (
    <div className="flex items-center justify-center h-full text-slate-500">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Нет сообщений</p>
      </div>
    </div>
  ) : (
    messages.map((msg, index) => {
      const isMine = msg.user_id === user?.id;

      return (
        <div
          key={msg.id || index}
          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md break-words ${
              isMine
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-white/10 text-white rounded-bl-md'
            }`}
          >
            {!isMine && (
  <p className="text-xs text-indigo-300 mb-1 font-medium">
    {(msg as any).username || 'Пользователь'}
  </p>
)}

            <p className="text-sm leading-relaxed">
              {msg.content}
            </p>

            <div
              className={`text-[10px] mt-1 opacity-70 ${
                isMine ? 'text-right' : 'text-left'
              }`}
            >
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      );
    })
  )}
</div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
  <button
    onClick={() => setShowEmoji(!showEmoji)}
    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
  >
    <SmilePlus className="w-5 h-5" />
  </button>

  {showEmoji && (
    <div className="absolute bottom-12 left-0 z-50">
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          setNewMessage((prev) => prev + emojiData.emoji);
        }}
      />
    </div>
  )}
</div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Написать сообщение..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button
  size="sm"
  icon={<Send className="w-4 h-4" />}
  onClick={async () => {
    if (!selectedRoom || !newMessage.trim()) return;

    await sendMessage(selectedRoom, newMessage);

    setNewMessage('');
  }}
>
  Отправить
</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="w-16 h-16" />}
                title="Выберите комнату"
                description="Выберите комнату из списка слева или создайте новую"
              />
            </Card>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Создать комнату">
        <div className="space-y-4">
          <Input label="Название" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} placeholder="Название комнаты" />
          <Input label="Описание" value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} placeholder="Описание (необязательно)" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Тип</label>
              <select
                value={newRoom.type}
                onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="public" className="bg-slate-800">Публичная</option>
                <option value="private" className="bg-slate-800">Приватная</option>
                <option value="password" className="bg-slate-800">С паролем</option>
              </select>
            </div>
            <Input label="Категория" value={newRoom.category} onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })} placeholder="Тема" />
          </div>
          {newRoom.type === 'password' && (
            <Input label="Пароль" value={newRoom.password} onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })} placeholder="Пароль для входа" type="password" />
          )}
          <Button
  className="w-full"
  onClick={async () => {
    const result = await createRoom({
      name: newRoom.name,
      description: newRoom.description,
      type: newRoom.type as 'public' | 'private' | 'password',
      category: newRoom.category,
      password: newRoom.password,
      is_active: true,
    });

    if (result.error) {
      alert(result.error);
      console.error(result.error);
      return;
    }

    await fetchRooms();

    setCreateOpen(false);

    setNewRoom({
      name: '',
      description: '',
      type: 'public',
      category: '',
      password: '',
    });

    alert('Комната создана');
  }}
>
  Создать
</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Rooms;

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useUILanguage } from '@/contexts/UILanguageContext';
import AppSidebar from '@/components/shared/AppSidebar';
import TopBar from '@/components/shared/TopBar';
import { Search, History, MessageCircle, Pencil, Check, Trash2, ChevronLeft, X } from 'lucide-react';

interface ConvDoc {
  id: string;
  name: string | null;
  type: string;
  createdAt: Date;
  messageCount: number;
  scenarioId: string | null;
  practiceTopic: string | null;
  pronunciationId: string | null;
  phase: string | null;
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  en: { conversation: 'Free Talk', assessment: 'Assessment', practice: 'Practice', pronunciation: 'Pronunciation', scenario: 'Scenario' },
  it: { conversation: 'Conversazione', assessment: 'Assessment', practice: 'Pratica', pronunciation: 'Pronuncia', scenario: 'Scenario' },
  es: { conversation: 'Conversación', assessment: 'Evaluación', practice: 'Práctica', pronunciation: 'Pronunciación', scenario: 'Escenario' },
  fr: { conversation: 'Conversation', assessment: 'Évaluation', practice: 'Pratique', pronunciation: 'Prononciation', scenario: 'Scénario' },
  de: { conversation: 'Gespräch', assessment: 'Bewertung', practice: 'Übung', pronunciation: 'Aussprache', scenario: 'Szenario' },
  pt: { conversation: 'Conversa', assessment: 'Avaliação', practice: 'Prática', pronunciation: 'Pronúncia', scenario: 'Cenário' },
  ja: { conversation: '会話', assessment: '評価', practice: '練習', pronunciation: '発音', scenario: 'シナリオ' },
  zh: { conversation: '对话', assessment: '测评', practice: '练习', pronunciation: '发音', scenario: '场景' },
  ko: { conversation: '대화', assessment: '평가', practice: '연습', pronunciation: '발음', scenario: '시나리오' },
  ru: { conversation: 'Разговор', assessment: 'Оценка', practice: 'Практика', pronunciation: 'Произношение', scenario: 'Сценарий' },
  ar: { conversation: 'محادثة', assessment: 'تقييم', practice: 'تدريب', pronunciation: 'نطق', scenario: 'سيناريو' },
  hi: { conversation: 'बातचीत', assessment: 'मूल्यांकन', practice: 'अभ्यास', pronunciation: 'उच्चारण', scenario: 'परिदृश्य' },
  tr: { conversation: 'Konuşma', assessment: 'Değerlendirme', practice: 'Alıştırma', pronunciation: 'Telaffuz', scenario: 'Senaryo' },
  nl: { conversation: 'Gesprek', assessment: 'Beoordeling', practice: 'Oefening', pronunciation: 'Uitspraak', scenario: 'Scenario' },
  pl: { conversation: 'Rozmowa', assessment: 'Ocena', practice: 'Ćwiczenie', pronunciation: 'Wymowa', scenario: 'Scenariusz' },
};

const UI_STRINGS: Record<string, {
  title: string; search: string; filterAll: string; filterConversation: string;
  filterPractice: string; filterScenario: string; noResults: string;
  messages: string; rename: string; save: string; saved: string;
  delete: string; confirmDelete: string; cancel: string; unnamed: string;
}> = {
  en: { title: 'Conversation History', search: 'Search by name or topic…', filterAll: 'All', filterConversation: 'Free Talk', filterPractice: 'Practice', filterScenario: 'Scenario', noResults: 'No conversations found.', messages: 'messages', rename: 'Rename', save: 'Save', saved: 'Saved!', delete: 'Delete', confirmDelete: 'Delete this conversation?', cancel: 'Cancel', unnamed: 'Untitled conversation' },
  it: { title: 'Cronologia conversazioni', search: 'Cerca per nome o argomento…', filterAll: 'Tutte', filterConversation: 'Free Talk', filterPractice: 'Pratica', filterScenario: 'Scenario', noResults: 'Nessuna conversazione trovata.', messages: 'messaggi', rename: 'Rinomina', save: 'Salva', saved: 'Salvato!', delete: 'Elimina', confirmDelete: 'Eliminare questa conversazione?', cancel: 'Annulla', unnamed: 'Conversazione senza nome' },
  es: { title: 'Historial de conversaciones', search: 'Buscar por nombre o tema…', filterAll: 'Todas', filterConversation: 'Free Talk', filterPractice: 'Práctica', filterScenario: 'Escenario', noResults: 'No se encontraron conversaciones.', messages: 'mensajes', rename: 'Renombrar', save: 'Guardar', saved: '¡Guardado!', delete: 'Eliminar', confirmDelete: '¿Eliminar esta conversación?', cancel: 'Cancelar', unnamed: 'Conversación sin nombre' },
  fr: { title: 'Historique des conversations', search: 'Rechercher par nom ou sujet…', filterAll: 'Toutes', filterConversation: 'Free Talk', filterPractice: 'Pratique', filterScenario: 'Scénario', noResults: 'Aucune conversation trouvée.', messages: 'messages', rename: 'Renommer', save: 'Sauvegarder', saved: 'Sauvegardé!', delete: 'Supprimer', confirmDelete: 'Supprimer cette conversation?', cancel: 'Annuler', unnamed: 'Conversation sans nom' },
  de: { title: 'Gesprächsverlauf', search: 'Nach Name oder Thema suchen…', filterAll: 'Alle', filterConversation: 'Free Talk', filterPractice: 'Übung', filterScenario: 'Szenario', noResults: 'Keine Gespräche gefunden.', messages: 'Nachrichten', rename: 'Umbenennen', save: 'Speichern', saved: 'Gespeichert!', delete: 'Löschen', confirmDelete: 'Dieses Gespräch löschen?', cancel: 'Abbrechen', unnamed: 'Unbenanntes Gespräch' },
  pt: { title: 'Histórico de conversas', search: 'Pesquisar por nome ou tópico…', filterAll: 'Todas', filterConversation: 'Free Talk', filterPractice: 'Prática', filterScenario: 'Cenário', noResults: 'Nenhuma conversa encontrada.', messages: 'mensagens', rename: 'Renomear', save: 'Salvar', saved: 'Salvo!', delete: 'Excluir', confirmDelete: 'Excluir esta conversa?', cancel: 'Cancelar', unnamed: 'Conversa sem nome' },
  ja: { title: '会話履歴', search: '名前やトピックで検索…', filterAll: 'すべて', filterConversation: 'フリートーク', filterPractice: '練習', filterScenario: 'シナリオ', noResults: '会話が見つかりません。', messages: 'メッセージ', rename: '名前変更', save: '保存', saved: '保存済み!', delete: '削除', confirmDelete: 'この会話を削除しますか?', cancel: 'キャンセル', unnamed: '名前なしの会話' },
  zh: { title: '对话历史', search: '按名称或主题搜索…', filterAll: '全部', filterConversation: '自由对话', filterPractice: '练习', filterScenario: '场景', noResults: '未找到对话。', messages: '条消息', rename: '重命名', save: '保存', saved: '已保存!', delete: '删除', confirmDelete: '删除此对话?', cancel: '取消', unnamed: '无名对话' },
  ko: { title: '대화 기록', search: '이름 또는 주제로 검색…', filterAll: '전체', filterConversation: '자유 대화', filterPractice: '연습', filterScenario: '시나리오', noResults: '대화를 찾을 수 없습니다.', messages: '메시지', rename: '이름 변경', save: '저장', saved: '저장됨!', delete: '삭제', confirmDelete: '이 대화를 삭제하시겠습니까?', cancel: '취소', unnamed: '이름 없는 대화' },
  ru: { title: 'История разговоров', search: 'Поиск по имени или теме…', filterAll: 'Все', filterConversation: 'Свободный разговор', filterPractice: 'Практика', filterScenario: 'Сценарий', noResults: 'Разговоры не найдены.', messages: 'сообщений', rename: 'Переименовать', save: 'Сохранить', saved: 'Сохранено!', delete: 'Удалить', confirmDelete: 'Удалить этот разговор?', cancel: 'Отмена', unnamed: 'Безымянный разговор' },
  ar: { title: 'سجل المحادثات', search: 'بحث بالاسم أو الموضوع…', filterAll: 'الكل', filterConversation: 'محادثة حرة', filterPractice: 'تدريب', filterScenario: 'سيناريو', noResults: 'لا توجد محادثات.', messages: 'رسائل', rename: 'إعادة تسمية', save: 'حفظ', saved: 'تم الحفظ!', delete: 'حذف', confirmDelete: 'حذف هذه المحادثة?', cancel: 'إلغاء', unnamed: 'محادثة بدون اسم' },
  hi: { title: 'बातचीत का इतिहास', search: 'नाम या विषय से खोजें…', filterAll: 'सभी', filterConversation: 'फ्री टॉक', filterPractice: 'अभ्यास', filterScenario: 'परिदृश्य', noResults: 'कोई बातचीत नहीं मिली।', messages: 'संदेश', rename: 'नाम बदलें', save: 'सहेजें', saved: 'सहेजा!', delete: 'हटाएं', confirmDelete: 'यह बातचीत हटाएं?', cancel: 'रद्द करें', unnamed: 'अनाम बातचीत' },
  tr: { title: 'Konuşma geçmişi', search: 'Ad veya konuya göre ara…', filterAll: 'Tümü', filterConversation: 'Serbest konuşma', filterPractice: 'Alıştırma', filterScenario: 'Senaryo', noResults: 'Konuşma bulunamadı.', messages: 'mesaj', rename: 'Yeniden adlandır', save: 'Kaydet', saved: 'Kaydedildi!', delete: 'Sil', confirmDelete: 'Bu konuşmayı sil?', cancel: 'İptal', unnamed: 'Adsız konuşma' },
  nl: { title: 'Gespreksgeschiedenis', search: 'Zoeken op naam of onderwerp…', filterAll: 'Alle', filterConversation: 'Vrij gesprek', filterPractice: 'Oefening', filterScenario: 'Scenario', noResults: 'Geen gesprekken gevonden.', messages: 'berichten', rename: 'Hernoemen', save: 'Opslaan', saved: 'Opgeslagen!', delete: 'Verwijderen', confirmDelete: 'Dit gesprek verwijderen?', cancel: 'Annuleren', unnamed: 'Naamloos gesprek' },
  pl: { title: 'Historia rozmów', search: 'Szukaj według nazwy lub tematu…', filterAll: 'Wszystkie', filterConversation: 'Swobodna rozmowa', filterPractice: 'Ćwiczenie', filterScenario: 'Scenariusz', noResults: 'Nie znaleziono rozmów.', messages: 'wiadomości', rename: 'Zmień nazwę', save: 'Zapisz', saved: 'Zapisano!', delete: 'Usuń', confirmDelete: 'Usunąć tę rozmowę?', cancel: 'Anuluj', unnamed: 'Rozmowa bez nazwy' },
};

function getUiStr(lang: string) {
  return UI_STRINGS[lang] ?? UI_STRINGS['en'];
}

function getTypeLabel(type: string, conv: ConvDoc, lang: string) {
  const labels = TYPE_LABELS[lang] ?? TYPE_LABELS['en'];
  if (conv.scenarioId) return labels.scenario;
  if (conv.practiceTopic) return labels.practice;
  if (conv.pronunciationId) return labels.pronunciation;
  return labels[type] ?? type;
}

function formatDate(date: Date, lang: string) {
  return date.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { uiLang } = useUILanguage();
  const router = useRouter();
  const s = getUiStr(uiLang);

  const [conversations, setConversations] = useState<ConvDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'conversation' | 'practice' | 'scenario'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const q = query(collection(db, 'users', user.uid, 'conversations'), orderBy('createdAt', 'desc'));
    getDocs(q).then((snap) => {
      const docs: ConvDoc[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? null,
          type: data.type ?? 'conversation',
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          messageCount: data.messageCount ?? 0,
          scenarioId: data.scenarioId ?? null,
          practiceTopic: data.practiceTopic ?? null,
          pronunciationId: data.pronunciationId ?? null,
          phase: data.phase ?? null,
        };
      });
      setConversations(docs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, router]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (filter !== 'all') {
      list = list.filter((c) => {
        if (filter === 'scenario') return !!c.scenarioId;
        if (filter === 'practice') return !!c.practiceTopic || !!c.pronunciationId;
        return !c.scenarioId && !c.practiceTopic && !c.pronunciationId;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.name ?? '').toLowerCase().includes(q) ||
        (c.practiceTopic ?? '').toLowerCase().includes(q) ||
        (c.scenarioId ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, filter, search]);

  async function handleSaveName(conv: ConvDoc) {
    if (!user || !editingName.trim()) return;
    setSavingId(conv.id);
    await updateDoc(doc(db, 'users', user.uid, 'conversations', conv.id), { name: editingName.trim() }).catch(() => {});
    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, name: editingName.trim() } : c));
    setSavingId(null);
    setSavedId(conv.id);
    setEditingId(null);
    setTimeout(() => setSavedId(null), 2000);
  }

  async function handleDelete(convId: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'conversations', convId)).catch(() => {});
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    setDeleteConfirmId(null);
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[var(--app-bg)] overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: s.title }]} />

        <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--app-text)]">{s.title}</h1>
              <p className="text-xs text-[var(--app-muted)]">{conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-3 py-2.5 mb-3">
            <Search className="w-4 h-4 text-[var(--app-muted)] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={s.search}
              className="flex-1 bg-transparent text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['all', 'conversation', 'practice', 'scenario'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[var(--app-surface)] text-[var(--app-muted)] border border-[var(--app-border)] hover:text-[var(--app-text)]'
                }`}
              >
                {f === 'all' ? s.filterAll : f === 'conversation' ? s.filterConversation : f === 'practice' ? s.filterPractice : s.filterScenario}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-[var(--app-surface)] rounded-2xl animate-pulse border border-[var(--app-border)]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-10 h-10 text-[var(--app-muted)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--app-muted)] text-sm">{s.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((conv) => (
                <div
                  key={conv.id}
                  className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl px-4 py-3 transition-colors hover:border-indigo-500/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {editingId === conv.id ? (
                        <div className="flex gap-2 items-center mb-1">
                          <input
                            autoFocus
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(conv); if (e.key === 'Escape') setEditingId(null); }}
                            maxLength={60}
                            className="flex-1 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-lg px-2 py-1 text-sm text-[var(--app-text)] outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleSaveName(conv)}
                            disabled={!!savingId}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-semibold transition-colors disabled:opacity-50"
                          >
                            {savingId === conv.id ? '…' : savedId === conv.id ? s.saved : s.save}
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-semibold text-[var(--app-text)] truncate">
                            {conv.name ?? s.unnamed}
                          </p>
                          {savedId === conv.id && <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600/15 text-indigo-500">
                          {getTypeLabel(conv.type, conv, uiLang)}
                        </span>
                        <span className="text-xs text-[var(--app-muted)]">{formatDate(conv.createdAt, uiLang)}</span>
                        <span className="text-xs text-[var(--app-muted)]">{conv.messageCount} {s.messages}</span>
                      </div>
                      {(conv.practiceTopic || conv.scenarioId) && (
                        <p className="text-xs text-[var(--app-muted)] mt-0.5 truncate">{conv.practiceTopic ?? conv.scenarioId}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button
                        onClick={() => { setEditingId(conv.id); setEditingName(conv.name ?? ''); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)] transition-colors"
                        title={s.rename}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(conv.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--app-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title={s.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={() => setDeleteConfirmId(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl px-6 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center mb-3 mx-auto">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-center text-sm font-semibold text-[var(--app-text)] mb-4">{s.confirmDelete}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-border)] transition-colors"
              >
                {s.cancel}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors"
              >
                {s.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

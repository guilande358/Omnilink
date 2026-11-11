import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useOmniLink } from '../../context/OmniLinkContext';
import { auth } from '../../firebase';
import { leadService } from '../../services/firestoreService';
import { LeadItem } from '../../types';
import {
  Mail,
  Download,
  Users,
  CheckCircle,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { LeadCaptureForm } from '../LeadCaptureForm';

export const LeadCaptureTab: React.FC = () => {
  const { profile, updateProfile, currentUser, leads: fallbackLeads } = useOmniLink();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Form local state for headline and button text
  const isEnabled = profile.enableLeadForm !== false;
  const [headline, setHeadline] = useState(profile.leadFormHeadline || '');
  const [buttonText, setButtonText] = useState(profile.leadFormButtonText || '');

  useEffect(() => {
    setHeadline(profile.leadFormHeadline || '');
    setButtonText(profile.leadFormButtonText || '');
  }, [profile.leadFormHeadline, profile.leadFormButtonText]);

  // Load real leads from Firestore directly for currentUser
  const fetchRealLeads = async () => {
    if (currentUser?.id && auth.currentUser && auth.currentUser.uid === currentUser.id) {
      setRefreshing(true);
      try {
        const remoteLeads = await leadService.getLeadsByUserId(currentUser.id);
        setLeads(remoteLeads);
      } catch (err) {
        console.error('Failed to fetch real leads from Firestore:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } else {
      setLeads(fallbackLeads || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealLeads();
  }, [currentUser?.id]);

  // Toggle email signup form visibility on public profile
  const handleToggleLeadForm = async () => {
    const nextState = !isEnabled;
    await updateProfile({ enableLeadForm: nextState });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleSaveFormConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      leadFormHeadline: headline.trim() || 'Receba Conteúdo & Acesso Exclusivo',
      leadFormButtonText: buttonText.trim() || 'Quero Receber Agora',
      enableLeadForm: true,
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Export leads to CRM-ready CSV using papaparse
  const handleExportToCsv = () => {
    if (leads.length === 0) return;

    // Transform leads into standardized CRM format (HubSpot, Mailchimp, Salesforce compatible)
    const crmData = leads.map((l) => {
      const rawName = (l.name || 'Subscriber').trim();
      const nameParts = rawName.split(' ');
      const firstName = nameParts[0] || rawName;
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        'Lead ID': l.id,
        'Email Address': l.email,
        'Full Name': rawName,
        'First Name': firstName,
        'Last Name': lastName,
        'Date Captured': l.createdAt,
        'Formatted Date': new Date(l.createdAt).toLocaleString(),
        'Bio Owner': `@${profile.username || 'creator'}`,
        'Lead Magnet Offer': profile.leadFormHeadline || 'Default Opt-in',
        'Status': 'Subscribed',
      };
    });

    const csvString = Papa.unparse(crmData, {
      quotes: true,
      header: true,
    });

    // Prepend UTF-8 BOM so Excel and CRM import tools open accented characters correctly
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeUsername = (profile.username || 'leads').replace(/[^a-z0-9_-]/gi, '_');
    const fileTimestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `omnilink_leads_${safeUsername}_${fileTimestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Module Header & Visibility Toggle Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 text-white shadow-xl shadow-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              Lead Capture & Email Signup Module
            </h2>
          </div>
          <p className="text-xs text-white/80 max-w-xl">
            Adicione um formulário de captura de email à sua bio pública para converter visitantes casuais em assinantes e potenciais clientes.
          </p>
        </div>

        {/* Global Visibility Toggle Switch */}
        <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md p-2 rounded-2xl border border-white/20 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 pl-2">
            {isEnabled ? (
              <Eye className="w-4 h-4 text-emerald-300" />
            ) : (
              <EyeOff className="w-4 h-4 text-white/50" />
            )}
            <div className="text-left">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-white">
                {isEnabled ? 'Formulário Ativo na Bio' : 'Formulário Oculto'}
              </span>
              <span className="block text-[9px] text-white/70">
                {isEnabled ? 'Visível aos visitantes' : 'Desativado na página pública'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleLeadForm}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isEnabled ? 'bg-sky-400' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={isEnabled}
            title={isEnabled ? 'Clique para ocultar o formulário na bio' : 'Clique para exibir o formulário na bio'}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Success Notice */}
      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Configuração salva com sucesso no Firestore! A sua bio pública foi atualizada.</span>
        </div>
      )}

      {/* Form Customization Card */}
      <form
        onSubmit={handleSaveFormConfig}
        className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Personalização do Formulário de Inscrição
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Configure a headline irresistível e o texto do botão CTA para maximizar sua taxa de conversão.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            Armazenamento Firestore
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Título da Oferta / Headline do Formulário
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="ex: Baixe meu Guia Gratuito de Crescimento Digital"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Texto do Botão de Envio (CTA)
            </label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="ex: Quero Receber o Guia Grátis ($0)"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Salvar Formulário & Sincronizar na Bio</span>
        </button>
      </form>

      {/* Live Interactive Form Preview & Test Section */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/50 rounded-2xl space-y-3 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Interactive Form Preview & Teste
              </h3>
              <p className="text-[11px] text-white/70">
                {isEnabled
                  ? 'Teste o formulário ao vivo com validação e animações de sucesso salvas no Firestore.'
                  : '⚠️ O formulário está atualmente oculto na sua página bio pública.'}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {isEnabled ? 'Visível na Bio' : 'Oculto na Bio'}
          </span>
        </div>

        <div className="max-w-md mx-auto pt-2">
          <LeadCaptureForm
            userId={currentUser?.id}
            profileUsername={profile.username}
            headline={headline || profile.leadFormHeadline}
            buttonText={buttonText || profile.leadFormButtonText}
            theme={profile.theme}
            showNameField={true}
            onSuccess={() => {
              // Automatically refresh table when a new lead is tested!
              fetchRealLeads();
            }}
          />
        </div>
      </div>

      {/* Captured Subscribers List with Real Firestore Data */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Assinantes Capturados no Firestore ({leads.length})</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Lista de contatos obtidos através do formulário de captura da sua bio.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchRealLeads}
              disabled={refreshing}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-colors disabled:opacity-50"
              title="Recarregar leads do Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportToCsv}
              disabled={leads.length === 0}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              title="Exportar contatos para CSV para CRM (HubSpot, Mailchimp, Salesforce)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar para CSV ({leads.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {leads.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou endereço de email..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Carregando leads reais do Firestore...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
            <Mail className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhum lead capturado ainda. O formulário na sua bio começará a coletar assinantes automaticamente.
            </p>
          </div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    <th className="py-2.5 px-4">Nome do Assinante</th>
                    <th className="py-2.5 px-4">Endereço de Email</th>
                    <th className="py-2.5 px-4">Data de Inscrição</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {lead.name || 'Subscriber'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {lead.email}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Ativo</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { LeadCaptureTab as LeadCaptureModule };

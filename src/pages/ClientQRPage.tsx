import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import Layout from '../components/common/Layout';
import { clientApi } from '../api/client';
import { useToast } from '../components/common/Toast';
import { Client } from '../types';
import { ArrowLeft, Download, Printer, RefreshCw, Copy, ExternalLink } from 'lucide-react';

const ClientQRPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const fetchClient = async () => {
    try {
      const response = await clientApi.getClient(id!);
      if (response.data.success && response.data.data) {
        setClient(response.data.data);
      } else {
        showToast('Client not found', 'error');
        navigate('/clients');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      showToast('Failed to load client', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleRegenerateQR = async () => {
    if (!client) return;
    setRegenerating(true);

    try {
      const response = await clientApi.regenerateQR(client.id);
      if (response.data.success) {
        showToast('QR code regenerated successfully', 'success');
        await fetchClient();
      }
    } catch (error) {
      console.error('Error regenerating QR:', error);
      showToast('Failed to regenerate QR code', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => qrRef.current,
    documentTitle: `QR-${client?.code || 'client'}`,
    onAfterPrint: () => showToast('Print job sent', 'success'),
  });

  const handleDownloadPNG = () => {
    if (!client) return;
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `QR-${client.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('QR code downloaded', 'success');
    }
  };

  const handleDownloadSVG = () => {
    if (!client) return;
    const svg = document.querySelector('.qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `QR-${client.code}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('QR code downloaded as SVG', 'success');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading QR code...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white">Client not found</h2>
        </div>
      </Layout>
    );
  }

  const clientUrl = `${import.meta.env.VITE_CLIENT_BASE_URL}/c/${client.code}`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/clients/${client.id}`)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">QR Code</h1>
            <p className="text-gray-400">{client.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegenerateQR}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <div className="flex flex-col items-center">
            <div
              ref={qrRef}
              className="bg-white p-8 rounded-xl shadow-2xl mb-6"
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">PHANTOM DROID</h3>
                <p className="text-sm text-gray-600">{client.name}</p>
              </div>
              <QRCodeSVG
                value={clientUrl}
                size={256}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
                className="qr-code-svg"
              />
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 break-all">{clientUrl}</p>
                <p className="text-xs text-gray-400 mt-1">Client: {client.code}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownloadPNG}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={handleDownloadSVG}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download SVG
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => copyToClipboard(clientUrl, 'Client URL')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>
              <a
                href={`/c/${client.code}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Client
              </a>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Client Name</p>
            <p className="text-white font-medium">{client.name}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Client Code</p>
            <code className="text-white">{client.code}</code>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 md:col-span-2">
            <p className="text-sm text-gray-400">Client URL</p>
            <p className="text-indigo-400 text-sm break-all">{clientUrl}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientQRPage;

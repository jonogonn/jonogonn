import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import {
  Database,
  Download,
  Server,
  Cloud,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  Activity,
  FileText,
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function DatabaseBackupManager({ triggerSaveToast }) {
  const {
    articles,
    categories,
    podcasts,
    emergencyServices,
    settings,
    adminLanguage,
    language,
    showSuccess,
    showError
  } = useNews();

  const isBn = (adminLanguage || language) === 'bn';

  const [isExportingMariaDb, setIsExportingMariaDb] = useState(false);
  const [isExportingSupabase, setIsExportingSupabase] = useState(false);
  const [isExportingB2, setIsExportingB2] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  // Live MariaDB Activity Logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch activity logs from MariaDB
  const fetchActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/log_activity.php?limit=25');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.logs)) {
          setActivityLogs(json.logs);
        }
      }
    } catch (err) {
      console.warn('Activity log fetch notice:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // 1. Download cPanel MariaDB Database SQL Dump
  const handleDownloadMariaDbSql = async () => {
    setIsExportingMariaDb(true);
    try {
      // Trigger download from backend exporter
      const link = document.createElement('a');
      link.href = '/api/export_database.php';
      link.setAttribute('download', `jonogon_cpanel_mariadb_${Date.now()}.sql`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(
        isBn
          ? 'cPanel MariaDB ডাটাবেজের সম্পূর্ণ SQL ফাইল সফলভাবে ডাউনলোড শুরু হয়েছে!'
          : 'MariaDB SQL dump download started!'
      );
      if (triggerSaveToast) triggerSaveToast(isBn ? 'MariaDB SQL ডাউনলোড সম্পন্ন' : 'MariaDB SQL downloaded');
      setTimeout(fetchActivityLogs, 1000);
    } catch (err) {
      showError(isBn ? 'SQL ফাইল ডাউনলোডে সমস্যা হয়েছে।' : 'Error downloading SQL file.');
    } finally {
      setIsExportingMariaDb(false);
    }
  };

  // 2. Download Supabase Schema SQL
  const handleDownloadSupabaseSql = async () => {
    setIsExportingSupabase(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/export_supabase.php';
      link.setAttribute('download', `jonogon_supabase_schema_${Date.now()}.sql`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(
        isBn
          ? 'Supabase ডাটাবেজ এক্সেস ও RLS স্কিমা SQL ফাইল ডাউনলোড শুরু হয়েছে!'
          : 'Supabase SQL schema download started!'
      );
      if (triggerSaveToast) triggerSaveToast(isBn ? 'Supabase SQL ডাউনলোড সম্পন্ন' : 'Supabase SQL downloaded');
    } catch (err) {
      showError(isBn ? 'Supabase ফাইল ডাউনলোডে সমস্যা হয়েছে।' : 'Error downloading Supabase SQL.');
    } finally {
      setIsExportingSupabase(false);
    }
  };

  // 3. Download Backblaze B2 Media Assets Manifest
  const handleDownloadB2Manifest = async () => {
    setIsExportingB2(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/export_media.php';
      link.setAttribute('download', `jonogon_b2_media_manifest_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(
        isBn
          ? 'Backblaze B2 ক্লাউড মিডিয়া ও ছবির তথ্য তালিকা ডাউনলোড শুরু হয়েছে!'
          : 'Backblaze B2 media manifest downloaded!'
      );
      if (triggerSaveToast) triggerSaveToast(isBn ? 'B2 মিডিয়া ফাইল ডাউনলোড সম্পন্ন' : 'B2 media downloaded');
    } catch (err) {
      showError(isBn ? 'মিডিয়া ডাউনলোডে সমস্যা হয়েছে।' : 'Error downloading media manifest.');
    } finally {
      setIsExportingB2(false);
    }
  };

  // 4. Download Full Portal JSON Backup
  const handleDownloadFullJson = () => {
    setIsExportingJson(true);
    try {
      const fullBackup = {
        portal: 'Jonogon News (জনগণ.নিউজ)',
        exportedAt: new Date().toISOString(),
        siteSettings: settings,
        articlesCount: articles.length,
        articles: articles,
        categoriesCount: categories.length,
        categories: categories,
        podcastsCount: podcasts.length,
        podcasts: podcasts,
        emergencyCount: emergencyServices.length,
        emergencyServices: emergencyServices
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `jonogon_portal_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showSuccess(
        isBn
          ? 'সম্পূর্ণ পোর্টালের JSON ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!'
          : 'Full portal JSON backup downloaded!'
      );
      if (triggerSaveToast) triggerSaveToast(isBn ? 'JSON ব্যাকআপ ডাউনলোড সম্পন্ন' : 'JSON backup downloaded');
    } catch (e) {
      showError('JSON ব্যাকআপ তৈরিতে সমস্যা হয়েছে।');
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. TOP HEADER BANNER */}
      <div
        className="admin-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(220, 38, 38, 0.06) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: 'rgba(229, 9, 20, 0.12)',
                color: 'var(--primary-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={24} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary)'
                }}
              >
                {isBn ? 'ডাটাবেজ ও ক্লাউড ব্যাকআপ সেন্টার' : 'Database & Cloud Export Center'}
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                {isBn
                  ? 'এক ক্লিকে cPanel MariaDB ডাটাবেজ, Supabase স্কিমা এবং Backblaze B2 ক্লাউড স্টোরেজের ফাইল ডাউনলোড করুন।'
                  : '1-click export and download for cPanel MariaDB SQL, Supabase SQL schema, and Backblaze B2 assets.'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={fetchActivityLogs}
          disabled={isLoadingLogs}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}
        >
          <RefreshCw size={15} className={isLoadingLogs ? 'animate-spin' : ''} />
          <span>{isBn ? 'লগ রিফ্রেশ করুন' : 'Refresh Logs'}</span>
        </button>
      </div>

      {/* 2. FOUR PRIMARY 1-CLICK EXPORT DOWNLOAD CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* CARD 1: cPanel MariaDB Database SQL Dump */}
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '22px 24px',
            border: '1.5px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 12,
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.04) 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Server size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3B82F6',
                  padding: '3px 8px',
                  borderRadius: 6
                }}
              >
                .SQL DUMP
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.18rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              {isBn ? 'cPanel MariaDB ডাটাবেজ (.sql)' : 'cPanel MariaDB Database (.sql)'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {isBn
                ? 'হোস্টিং সার্ভারের সকল ১২টি টেবিল (সংবাদ, ক্যাটাগরি, সেটিংস, লগ সহ) সরাসরি phpMyAdmin এ ইমপোর্টযোগ্য ফরম্যাটে ডাউনলোড করুন।'
                : 'Complete SQL dump of all 12 MariaDB tables ready to import directly into cPanel phpMyAdmin.'}
            </p>
          </div>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleDownloadMariaDbSql}
            disabled={isExportingMariaDb}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 16px',
              fontWeight: 800,
              backgroundColor: '#3B82F6',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Download size={17} />
            <span>{isExportingMariaDb ? (isBn ? 'প্রস্তুত হচ্ছে...' : 'Preparing...') : (isBn ? 'MariaDB SQL ডাউনলোড' : 'Download MariaDB SQL')}</span>
          </button>
        </div>

        {/* CARD 2: Supabase Schema SQL */}
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '22px 24px',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 12,
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.04) 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cloud size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  padding: '3px 8px',
                  borderRadius: 6
                }}
              >
                SUPABASE .SQL
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.18rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              {isBn ? 'Supabase ডাটাবেজ ফাইল (.sql)' : 'Supabase SQL Schema (.sql)'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {isBn
                ? 'Supabase ক্লাউড প্রজেক্টের (mxzsmulbandttegciiiy) admin_users টেবিল, RLS পলিসি এবং সুপার অ্যাডমিন স্কিমা SQL ডাউনলোড করুন।'
                : 'Download Supabase master SQL schema with admin users table and Row Level Security policies.'}
            </p>
          </div>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleDownloadSupabaseSql}
            disabled={isExportingSupabase}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 16px',
              fontWeight: 800,
              backgroundColor: '#10B981',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={17} />
            <span>{isExportingSupabase ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Exporting...') : (isBn ? 'Supabase SQL ডাউনলোড' : 'Download Supabase SQL')}</span>
          </button>
        </div>

        {/* CARD 3: Backblaze B2 & Cloud Media Images */}
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '22px 24px',
            border: '1.5px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 12,
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.04) 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ImageIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  padding: '3px 8px',
                  borderRadius: 6
                }}
              >
                B2 CLOUD MEDIA
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.18rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              {isBn ? 'B2 ক্লাউড ছবি ও মিডিয়া মেটাডাটা' : 'Backblaze B2 Media Assets'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {isBn
                ? 'Backblaze B2 ক্লাউড বাকেটে আপলোড করা সকল WebP ছবি, ফটোকার্ড এবং সিডিএন ইউআরএল এর পূর্ণাঙ্গ মেটাডাটা ব্যাকআপ নিন।'
                : 'Export complete Backblaze B2 bucket media archive manifest with CDN WebP image URLs.'}
            </p>
          </div>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleDownloadB2Manifest}
            disabled={isExportingB2}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 16px',
              fontWeight: 800,
              backgroundColor: '#F59E0B',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Download size={17} />
            <span>{isExportingB2 ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Exporting...') : (isBn ? 'B2 মিডিয়া ব্যাকআপ ডাউনলোড' : 'Download B2 Media')}</span>
          </button>
        </div>

        {/* CARD 4: Complete Full Portal JSON Snapshot */}
        <div
          className="admin-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '22px 24px',
            border: '1.5px solid rgba(229, 9, 20, 0.3)',
            borderRadius: 12,
            background: 'linear-gradient(180deg, var(--bg-card) 0%, rgba(229, 9, 20, 0.04) 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  backgroundColor: 'rgba(229, 9, 20, 0.15)',
                  color: 'var(--primary-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HardDrive size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(229, 9, 20, 0.15)',
                  color: 'var(--primary-red)',
                  padding: '3px 8px',
                  borderRadius: 6
                }}
              >
                FULL JSON
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.18rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              {isBn ? 'সম্পূর্ণ পোর্টাল ব্যাকআপ (.json)' : 'Full Portal JSON Backup'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {isBn
                ? 'সকল সংবাদ, ক্যাটাগরি, পডকাস্ট, হেল্পলাইন ও ব্র্যান্ডিং সেটিংসের একটি সমন্বিত একক ব্যাকআপ ফাইল ডাউনলোড করুন।'
                : 'Download one unified JSON snapshot containing all articles, categories, podcasts, and site settings.'}
            </p>
          </div>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleDownloadFullJson}
            disabled={isExportingJson}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 16px',
              fontWeight: 800,
              backgroundColor: 'var(--primary-red)',
              boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)'
            }}
          >
            <Download size={17} />
            <span>{isExportingJson ? (isBn ? 'ডাউনলোড হচ্ছে...' : 'Exporting...') : (isBn ? 'JSON ব্যাকআপ ডাউনলোড' : 'Download JSON Backup')}</span>
          </button>
        </div>
      </div>

      {/* 3. MARIADB ALL-TABLES STATUS & ACTIVITY AUDIT TRAIL */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={20} color="var(--primary-red)" />
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              {isBn ? 'অ্যাডমিন প্যানেল অ্যাক্টিভিটি ও ডাটাবেজ লগ (MariaDB Logs)' : 'Real-time Admin Activity Logs'}
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isBn ? `সর্বশেষ ${activityLogs.length}টি অ্যাকশন রেকর্ড প্রদর্শিত` : `Showing latest ${activityLogs.length} logs`}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800 }}>
                  {isBn ? 'সময় ও তারিখ' : 'Timestamp'}
                </th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800 }}>
                  {isBn ? 'অ্যাডমিন / ইউজার' : 'User'}
                </th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800 }}>
                  {isBn ? 'ট্যাব / মডিউল' : 'Tab Module'}
                </th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 800 }}>
                  {isBn ? 'অ্যাকশন বিবরণ' : 'Action Description'}
                </th>
                <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                  {isBn ? 'স্ট্যাটাস' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                    {isBn ? 'কোন সাম্প্রতিক অ্যাক্টিভিটি লগ পাওয়া যায়নি।' : 'No recent activity logs found.'}
                  </td>
                </tr>
              ) : (
                activityLogs.map((log, idx) => (
                  <tr key={log.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} />
                        <span>{log.created_at || 'এখনই'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {log.user_name || 'মোঃ বিপ্লব হোসেন'}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3B82F6',
                          textTransform: 'uppercase'
                        }}
                      >
                        {log.tab_name || 'system'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {log.description}
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981'
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Recorded</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

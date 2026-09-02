@echo off
title Buscando 1 Milhao - Sistema Comercial com Gemini
echo ========================================================
echo   Iniciando Buscando 1 Milhao (Google Gemini + Next.js)
echo ========================================================
echo.

:: Abrir navegador automaticamente em 3 segundos
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Iniciar servidor Next.js
npm run dev

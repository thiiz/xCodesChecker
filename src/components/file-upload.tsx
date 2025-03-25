'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, FileText, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { FadeIn } from './ui/animation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type AccountData = {
    name: string;
    password: string;
    url: string;
};

type FileUploadProps = {
    onAccountsLoaded?: (count: number) => void;
};

export function FileUpload({ onAccountsLoaded }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        success: boolean;
        message: string;
        count?: number;
    } | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Verificar se é um arquivo .txt
        if (!file.name.endsWith('.txt')) {
            setUploadStatus({
                success: false,
                message: 'Por favor, selecione apenas arquivos .txt',
            });
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const accounts = parseAccountsFromText(text);

                if (accounts.length === 0) {
                    setUploadStatus({
                        success: false,
                        message: 'Nenhuma conta encontrada no arquivo',
                    });
                    return;
                }

                // Salvar no localStorage
                localStorage.setItem('uploadedAccounts', JSON.stringify(accounts));

                setUploadStatus({
                    success: true,
                    message: `${accounts.length} contas carregadas com sucesso`,
                    count: accounts.length,
                });

                if (onAccountsLoaded) {
                    onAccountsLoaded(accounts.length);
                }
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                setUploadStatus({
                    success: false,
                    message: 'Erro ao processar o arquivo',
                });
            } finally {
                setIsUploading(false);
            }
        };

        reader.onerror = () => {
            setUploadStatus({
                success: false,
                message: 'Erro ao ler o arquivo',
            });
            setIsUploading(false);
        };

        reader.readAsText(file);
    };

    // Função para extrair contas do texto
    const parseAccountsFromText = (text: string): AccountData[] => {
        const accounts: AccountData[] = [];

        // Identificar possíveis delimitadores de blocos de contas
        const possibleDelimiters = [
            '🇳‌ᗩS ⭐⭐', // Formato original
            'MUZO37 ⭐⭐', // Outro formato similar
            '🌀 𝐈𝐏𝐓𝐕 𝐒𝐂𝐀𝐍 🌀', // Formato do grupo do feh
            '╭─➤🌀', // Outro possível delimitador
            '\n\n' // Blocos separados por linhas em branco
        ];

        // Tentar dividir o texto usando diferentes delimitadores
        let accountBlocks: string[] = [];
        for (const delimiter of possibleDelimiters) {
            const blocks = text.split(delimiter);
            if (blocks.length > 1) {
                accountBlocks = blocks;
                break;
            }
        }

        // Se nenhum delimitador conhecido for encontrado, tente dividir por linhas em branco
        if (accountBlocks.length <= 1) {
            accountBlocks = text.split(/\n\s*\n/);
        }

        // Processar cada bloco
        for (let i = 0; i < accountBlocks.length; i++) {
            const block = accountBlocks[i];
            if (!block.trim()) continue; // Ignorar blocos vazios

            // Tentar extrair informações usando diferentes padrões
            let username = '';
            let password = '';
            let url = '';

            // Padrão 1: Formato original com Usᴇʀɴᴀᴍᴇ:⮕, Pᴀssᴡᴏʀᴅ: ⮕, Hᴏsᴛ:⮕
            const usernameMatch1 = block.match(/Us[eᴇ]r[nɴ]ᴀᴍ[eᴇ]:?[⮕\s]*([^\n]+)/i);
            const passwordMatch1 = block.match(/P[aᴀ]ss[wᴡ][oᴏ]r[dᴅ]:?[⮕\s]*([^\n]+)/i);
            const urlMatch1 = block.match(/H[oᴏ]s[tᴛ]:?[⮕\s]*([^\n]+)/i);

            // Padrão 2: Formato com 𝗨𝘀𝗲𝗿 ➤, 𝗣𝗮𝘀𝘀 ➤, 𝗛𝗢𝗦𝗧 ➤
            const usernameMatch2 = block.match(/[Uu]ser\s*[➤:>]\s*([^\n]+)/i);
            const passwordMatch2 = block.match(/[Pp]ass\s*[➤:>]\s*([^\n]+)/i);
            const hostMatch2 = block.match(/[Hh][Oo][Ss][Tt]\s*[➤:>]\s*([^\n]+)/i);

            // Padrão 3: Formato com m3u_Url ou Link contendo username e password
            const m3uMatch = block.match(/(?:m3u_Url|Lɪɴᴋ)[➤:>\s]*([^\s\n]+)/i);

            // Extrair username, password e url do link m3u se disponível
            if (m3uMatch) {
                const m3uUrl = m3uMatch[1].trim();
                const urlParams = new URL(m3uUrl);
                const extractedUsername = urlParams.searchParams.get('username');
                const extractedPassword = urlParams.searchParams.get('password');
                const extractedHost = urlParams.origin;

                if (extractedUsername) username = extractedUsername;
                if (extractedPassword) password = extractedPassword;
                if (extractedHost) url = extractedHost;
            }

            // Priorizar os matches diretos sobre os extraídos da URL
            if (usernameMatch1) username = usernameMatch1[1].trim();
            else if (usernameMatch2) username = usernameMatch2[1].trim();

            if (passwordMatch1) password = passwordMatch1[1].trim();
            else if (passwordMatch2) password = passwordMatch2[1].trim();

            if (urlMatch1) url = urlMatch1[1].trim();
            else if (hostMatch2) url = hostMatch2[1].trim();

            // Adicionar a conta se todos os campos necessários foram encontrados
            if (username && password && url) {
                accounts.push({
                    name: username,
                    password: password,
                    url: url
                });
            }
        }

        return accounts;
    };

    return (
        <FadeIn>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Carregar Contas
                    </CardTitle>
                    <CardDescription>
                        Selecione um arquivo .txt contendo as contas para testar (suporta múltiplos formatos)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            type="file"
                            accept=".txt"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="flex-1 cursor-pointer"
                            id="file-upload"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={isUploading}
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="rounded-full hover:bg-primary/10 transition-colors"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                    </div>

                    {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processando arquivo...</span>
                        </div>
                    )}

                    {uploadStatus && (
                        <div
                            className={`p-3 rounded-md text-sm flex items-center gap-2 ${uploadStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'} transition-all duration-300`}
                        >
                            {uploadStatus.success ? (
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span>{uploadStatus.message}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </FadeIn>
    );
}
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

        // Divide o texto em blocos de contas usando o delimitador específico
        const accountBlocks = text.split('\n');
        console.log("accountBlocks: ", accountBlocks)
        const m3uUrlRegex = /([\w.:/]+\/get\.php\?username=[^&]+&password=[^&]+&type=m3u_plus)/i;

        // Processa cada bloco (ignorando o primeiro se estiver vazio)
        for (let i = 1; i < accountBlocks.length; i++) {
            const block = accountBlocks[i];

            // Busca a URL m3u no bloco de forma genérica
            const m3uUrlMatch = block.match(m3uUrlRegex);
            if (m3uUrlMatch) {
                const m3uUrl = m3uUrlMatch[1].trim();

                try {
                    // Faz o parsing da URL utilizando o objeto URL do JavaScript
                    const urlObj = new URL(m3uUrl);
                    const username = urlObj.searchParams.get('username');
                    const password = urlObj.searchParams.get('password');
                    const host = urlObj.origin; // Inclui protocolo, domínio e porta (se houver)

                    if (username && password) {
                        accounts.push({
                            name: username,
                            password: password,
                            url: host
                        });
                    }
                } catch (error) {
                    console.error("URL inválida:", m3uUrl, error);
                }
            }
        }
        const uniqueAccounts = accounts.filter((account, index, self) =>
            index === self.findIndex(a => a.name === account.name && a.password === account.password && a.url === account.url)
        );
        if (uniqueAccounts.length === accounts.length) {
            setUploadStatus({
                success: true,
                message: `${accounts.length} contas carregadas com sucesso`,
                count: accounts.length,
            });
            return accounts;
        }
        setUploadStatus({
            success: true,
            message: `${accounts.length - uniqueAccounts.length}/${accounts.length} ~~> Contas Duplicadas Ignoradas.`,
            count: accounts.length,
        });
        return uniqueAccounts;
    }


    return (
        <FadeIn>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Carregar Contas
                    </CardTitle>
                    <CardDescription>
                        Selecione um arquivo .txt contendo as contas para testar
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
                            placeholder='teste'
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
                        <>
                            <div
                                className={`p-3 rounded-md text-sm flex items-center gap-2 ${uploadStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'} transition-all duration-300`}
                            >
                                {uploadStatus.success ? (
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className='capitalize'>{uploadStatus.message}</span>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </FadeIn>
    );
}
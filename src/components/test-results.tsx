'use client';

import { ProfileData } from '@/@types/ProfileData';
import { ButtonCopy } from '@/components/button-copy';
import { FadeIn, ScaleIn, SlideIn } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { AlertCircle, CheckCircle, Clock, Download, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

type GeneratedAccount = {
    name: string;
    password: string;
    url: string;
};

type AccountTestResult = {
    account: GeneratedAccount;
    status: {
        success: boolean;
        data?: ProfileData;
        error?: string;
    };
};

type TestResultsProps = {
    results: AccountTestResult[];
    isLoading: boolean;
    currentTestingIndex?: number;
    onBack?: () => void;
};

export function TestResults({ results, isLoading, currentTestingIndex, onBack }: TestResultsProps) {
    const [expandedResult, setExpandedResult] = useState<number | null>(null);
    const [copiedField, setCopiedField] = useState<{ index: number, field: string } | null>(null);
    const [totalAccounts, setTotalAccounts] = useState<number>(0);

    // Removed reset of expanded result when new results come in
    // This allows users to keep results expanded during testing

    // Get total accounts from localStorage
    useEffect(() => {
        const storedAccounts = localStorage.getItem('uploadedAccounts');
        if (storedAccounts) {
            try {
                const accounts = JSON.parse(storedAccounts);
                setTotalAccounts(accounts.length);
            } catch (error) {
                console.error('Error parsing stored accounts:', error);
            }
        }
    }, []);

    if (isLoading && results.length === 0) {
        return (
            <FadeIn>
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Testando Contas
                        </CardTitle>
                        <CardDescription>
                            Aguarde enquanto testamos suas contas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center p-8">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-muted-foreground text-sm">Iniciando testes...</p>
                        </div>
                    </CardContent>
                </Card>
            </FadeIn>
        );
    }

    if (results.length === 0 && !isLoading) {
        return null;
    }

    const successCount = results.filter(result => result.status.success).length;

    return (
        <FadeIn>
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <Clock className="h-5 w-5 text-primary" />
                                Testando Contas
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5 text-primary" />
                                Resultados dos Testes
                            </>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {isLoading
                            ? `Testando conta ${currentTestingIndex !== undefined ? currentTestingIndex + 1 : totalAccounts > 0 ? '1' : '0'} de ${totalAccounts}`
                            : `${successCount} de ${results.length} contas funcionando`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {results.map((result, index) => (
                            <SlideIn key={`${result.account.name}-${index}`} delay={index}>
                                <div
                                    className={`p-3 rounded-md border ${result.status.success
                                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                                        : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'} 
                    cursor-pointer transition-all duration-300 hover:shadow-sm`}
                                    onClick={() => setExpandedResult(expandedResult === index ? null : index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {result.status.success ? (
                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            )}
                                            <span className="font-medium truncate max-w-[200px]">{result.account.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {result.status.success ? 'Funcionando' : 'Falhou'}
                                        </span>
                                    </div>

                                    {expandedResult === index && (
                                        <ScaleIn>
                                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                                                <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
                                                    <span className="text-muted-foreground">URL:</span>
                                                    <span className="truncate">{result.account.url}</span>
                                                    <ButtonCopy
                                                        onClick={() => {
                                                            copyToClipboard({ text: result.account.url });
                                                            setCopiedField({ index, field: 'url' });
                                                            setTimeout(() => setCopiedField(null), 2000);
                                                        }}
                                                        isCopied={copiedField?.index === index && copiedField?.field === 'url'}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
                                                    <span className="text-muted-foreground">Usuário:</span>
                                                    <span className="truncate">{result.account.name}</span>
                                                    <ButtonCopy
                                                        onClick={() => {
                                                            copyToClipboard({ text: result.account.name });
                                                            setCopiedField({ index, field: 'name' });
                                                            setTimeout(() => setCopiedField(null), 2000);
                                                        }}
                                                        isCopied={copiedField?.index === index && copiedField?.field === 'name'}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
                                                    <span className="text-muted-foreground">Senha:</span>
                                                    <span className="truncate">{result.account.password}</span>
                                                    <ButtonCopy
                                                        onClick={() => {
                                                            copyToClipboard({ text: result.account.password });
                                                            setCopiedField({ index, field: 'password' });
                                                            setTimeout(() => setCopiedField(null), 2000);
                                                        }}
                                                        isCopied={copiedField?.index === index && copiedField?.field === 'password'}
                                                    />
                                                </div>

                                                {result.status.success && result.status.data && (
                                                    <>
                                                        {result.status.data.expirationDate && (
                                                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                                                <span className="text-muted-foreground">Expira em:</span>
                                                                <span>{new Date(parseInt(result.status.data.expirationDate) * 1000).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        {result.status.data.maxConnections && (
                                                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                                                <span className="text-muted-foreground">Conexões:</span>
                                                                <span>{result.status.data.activeConnections || '0'}/{result.status.data.maxConnections}</span>
                                                            </div>
                                                        )}
                                                        {result.status.data.status && (
                                                            <div className="grid grid-cols-[100px_1fr] gap-2">
                                                                <span className="text-muted-foreground">Status:</span>
                                                                <span className="capitalize">{result.status.data.status}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {!result.status.success && result.status.error && (
                                                    <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        <span>{result.status.error}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </ScaleIn>
                                    )}
                                </div>
                            </SlideIn>
                        ))}

                        {isLoading && currentTestingIndex !== undefined && currentTestingIndex >= results.length && (
                            <SlideIn key="testing-now" delay={results.length}>
                                <div className="p-3 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                                            <span className="font-medium">Testando...</span>
                                        </div>
                                    </div>
                                </div>
                            </SlideIn>
                        )}
                    </div>
                    {!isLoading && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                            {results.filter(result => result.status.success).length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const successfulAccounts = results.filter(result => result.status.success);
                                        let fileContent = `Scan date - ${new Date().getTime()}:\n\n`;

                                        successfulAccounts.forEach(result => {
                                            fileContent += `m3u_url: ${result.account.url}/get.php?username=${result.account.name}&password=${result.account.password}&type=m3u_plus\n`;
                                            // if (result.status.data) {
                                            //     if (result.status.data.expirationDate) {
                                            //         fileContent += `Expira em: ${new Date(parseInt(result.status.data.expirationDate) * 1000).toLocaleDateString()}\n`;
                                            //     }
                                            //     if (result.status.data.maxConnections) {
                                            //         fileContent += `Conexões: ${result.status.data.activeConnections || '0'}/${result.status.data.maxConnections}\n`;
                                            //     }
                                            //     if (result.status.data.status) {
                                            //         fileContent += `Status: ${result.status.data.status}\n`;
                                            //     }
                                            // }
                                            fileContent += "\n";
                                        });

                                        const blob = new Blob([fileContent], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `iptv_accounts_${new Date().getTime()}.txt`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Download className="h-4 w-4" />
                                    Exportar Contas Funcionando
                                </Button>
                            )}

                            {onBack && (
                                <Button
                                    variant="outline"
                                    onClick={onBack}
                                    className="w-full"
                                    size="lg"
                                >
                                    Voltar
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </FadeIn>
    );
}
'use client'
import { ProfileData } from "@/@types/ProfileData";
import { FileUpload } from "@/components/file-upload";
import { TestResults } from "@/components/test-results";
import { ScaleIn } from "@/components/ui/animation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

type GeneratedAccount = {
  name: string;
  password: string;
  url: string;
}

type TestStatus = {
  isLoading: boolean;
  success?: boolean;
  data?: ProfileData;
  error?: string;
}

type AccountTestResult = {
  account: GeneratedAccount;
  status: {
    success: boolean;
    data?: ProfileData;
    error?: string;
  };
}
export default function Home() {
  const [isTesting, setIsTesting] = useState(false)
  const [uploadedAccountsCount, setUploadedAccountsCount] = useState<number>(0)
  const [testResults, setTestResults] = useState<AccountTestResult[]>([])
  const [currentTestingIndex, setCurrentTestingIndex] = useState<number | undefined>(undefined)
  // Verificar se existem contas carregadas no localStorage ao iniciar
  useEffect(() => {
    const storedAccounts = localStorage.getItem('uploadedAccounts');
    if (storedAccounts) {
      try {
        const accounts = JSON.parse(storedAccounts);
        setUploadedAccountsCount(accounts.length);
      } catch (error) {
        console.error('Error parsing stored accounts:', error);
      }
    }
  }, []);

  async function onSubmit() {
    try {
      setIsTesting(true);
      setTestResults([]);
      const storedAccounts = localStorage.getItem('uploadedAccounts');

      if (storedAccounts) {
        try {
          const accounts = JSON.parse(storedAccounts) as GeneratedAccount[];
          if (accounts.length > 0) {
            // Testar todas as contas
            const results: AccountTestResult[] = [];
            setTestResults(results);

            for (let i = 0; i < accounts.length; i++) {
              const account = accounts[i];
              setCurrentTestingIndex(i);

              try {
                // Call our API endpoint
                const response = await fetch(
                  `/api/test-account?username=${encodeURIComponent(account.name)}&password=${encodeURIComponent(account.password)}&url=${encodeURIComponent(account.url)}`
                );

                const data = await response.json();

                if (!response.ok) {
                  results.push({
                    account,
                    status: {
                      success: false,
                      error: data.error || 'Failed to test account'
                    }
                  });
                } else {
                  results.push({
                    account,
                    status: {
                      success: true,
                      data: data as ProfileData
                    }
                  });
                }

                // Atualizar os resultados em tempo real
                setTestResults([...results]);

                // Pequena pausa para melhor visualização da animação
                await new Promise(resolve => setTimeout(resolve, 300));

              } catch (error) {
                console.error('Error testing account:', error);
                results.push({
                  account,
                  status: {
                    success: false,
                    error: 'An unexpected error occurred'
                  }
                });

                // Atualizar os resultados em tempo real
                setTestResults([...results]);
              }
            }

            setCurrentTestingIndex(undefined);
            setIsTesting(false);
            setTestResults(results);
          } else {
            console.error('No accounts found in localStorage');
          }
        } catch (error) {
          console.error('Error parsing stored accounts:', error);
        }
      }
    } catch (error) {
      console.error('Error testing account:', error);
      setIsTesting(false);
    }
  }
  const handleBack = () => {
    setTestResults([]);
  };

  return (
    <main className="py-8 md:py-12 lg:py-16 mx-auto max-w-4xl">
      {(testResults.length > 0 || isTesting) ? (
        <TestResults
          results={testResults}
          isLoading={isTesting}
          currentTestingIndex={currentTestingIndex}
          onBack={handleBack}
        />
      )
        :
        <Card className="mx-auto  max-w-md shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Gerador de Contas</CardTitle>
            <CardDescription className="text-muted-foreground">
              Teste suas contas de xtream codes e encontre a melhor conta para você.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload onAccountsLoaded={setUploadedAccountsCount} />

            {uploadedAccountsCount > 0 && (
              <ScaleIn delay={2}>
                <div className="text-sm bg-primary/10 text-primary rounded-md p-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{uploadedAccountsCount} contas carregadas</span>
                </div>
              </ScaleIn>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={onSubmit}
              disabled={isTesting || uploadedAccountsCount < 0}
              className="w-full transition-all duration-300 hover:bg-primary/90"
              size="lg"
            >
              Testar Contas
            </Button>
          </CardFooter>
        </Card>
      }
    </main>
  );
}

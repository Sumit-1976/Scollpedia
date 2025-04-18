import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthRequiredAlertProps {
  tabType: 'saved' | 'shared';
}

const AuthRequiredAlert: React.FC<AuthRequiredAlertProps> = ({ tabType }) => {
  return (
    <div className="text-center py-16">
      <Alert>
        <AlertDescription>
          Please log in to view your {tabType === 'saved' ? 'saved content' : 'content shared with you'}.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AuthRequiredAlert;
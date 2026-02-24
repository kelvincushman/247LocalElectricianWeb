import { X, Minimize2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
}

export default function ChatHeader({ onClose, onMinimize }: ChatHeaderProps) {
  return (
    <div className="bg-primary text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Sparky</h3>
          <p className="text-xs text-white/80">247Electrician Assistant</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <a
          href="tel:01902943929"
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Call us: 01902 943 929"
        >
          <Phone className="h-4 w-4" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10"
          onClick={onMinimize}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { StackHandler } from '@stackframe/stack';
import { stackServerApp } from '@/stack';

export default function HandlerPage() {
  return <StackHandler fullPage app={stackServerApp} />;
}

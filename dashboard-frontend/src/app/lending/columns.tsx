'use client';

import {ColumnDef} from '@tanstack/react-table';
import {format} from "date-fns"
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import {DataTableColumnHeader} from '@/components/ui/data-table';
import {ILendingHistoryTable} from '@/types';

// Helper function to get token image
const getTokenImage = (token: string): string | null => {
  const tokenImages: { [key: string]: string } = {
    'SOL': '/images/solana.avif',
    'WSOL': '/images/solana.avif',
    'USDT': '/images/usdt.png',
    'USDC': '/images/usdc.png',
    'ETH': '/images/ethereum.avif',
    'WETH': '/images/ethereum.avif',
    'BTC': '/images/btc.png',
    'WBTC': '/images/btc.png',
    'RAY': '/images/raydium.png',
    'GRASS': '/images/grass.png',
    'JUP': '/images/jupiter.png',
  };
  return tokenImages[token] || null; // Return null for unknown tokens
};

// Helper function to get platform image
const getPlatformImage = (platform: string): string | null => {
  const platformImages: { [key: string]: string } = {
    'KAMINO': '/images/kamino.png',
  };
  return platformImages[platform] || null; // Return null for unknown platforms
};

// Helper function to get action color
const getActionColor = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (action) {
    case 'LEND':
      return 'default';
    case 'BORROW':
      return 'destructive';
    case 'DEPOSIT':
      return 'default';
    case 'WITHDRAW':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Helper function to get status color
const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'COMPLETED':
    case 'SUCCESS':
      return 'default';
    case 'PENDING':
    case 'PROCESSING':
      return 'secondary';
    case 'FAILED':
    case 'ERROR':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const columns: ColumnDef<ILendingHistoryTable>[] = [
  {
    accessorKey: 'txDate',
    header: 'Tx. Date',
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue('txDate') ? format(new Date(row.getValue('txDate')), 'MMM dd, yyyy HH:mm') : '-'}
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      return (
        <Badge variant={getActionColor(action)}>
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'pair',
    header: 'Pair',
    cell: ({ row }) => {
      const pair = row.getValue('pair') as string;
      const [token, platform] = pair.split('-');
      const tokenImage = getTokenImage(token);
      const platformImage = getPlatformImage(platform);
      
      return (
        <div className="flex items-center gap-2">
          {tokenImage ? (
            <Image
              alt={token}
              className="rounded-full"
              height={24}
              src={tokenImage}
              width={24}
            />
          ) : null}
          {platformImage ? (
            <Image
              alt={platform}
              className="rounded-full"
              height={24}
              src={platformImage}
              width={24}
            />
          ) : null}
        </div>
      );
    },
  },

  {
    accessorKey: 'txDescription',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tx. Description" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('txDescription')}
      </div>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div className="font-mono">
        {row.getValue('amount')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
  },
];

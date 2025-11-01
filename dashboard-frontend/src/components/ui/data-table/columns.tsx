'use client';

import {ColumnDef} from '@tanstack/react-table';
import {format} from "date-fns"
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import {DataTableColumnHeader} from '@/components/ui/data-table';
import {ITradingHistoryTable} from '@/types';

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

// Helper function to get action color
const getActionColor = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (action) {
    case 'BUY':
      return 'default';
    case 'SELL':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Helper function to get status color
const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'COMPLETED':
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

export const columns: ColumnDef<ITradingHistoryTable>[] = [
    {
        accessorKey: 'txDate',
        header: 'Tx. Date',
        cell: ({row}) => (
            <div className="capitalize">
                {row.getValue('txDate') ? format(new Date(row.getValue('txDate')), 'MMM dd, yyyy HH:mm') : '-'}
            </div>
        ),
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({row}) => {
            const action = row.getValue('action') as string;
            return (
                <Badge variant={getActionColor(action)}>
                    {action}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'txDescription',
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tx. Description"/>
        ),
        cell: ({row}) => (
            <div className="font-medium">
                {row.getValue('txDescription')}
            </div>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({row}) => (
            <div className="font-mono">
                {row.getValue('amount')}
            </div>
        ),
    },
    {
        accessorKey: 'token',
        header: 'Token',
        cell: ({row}) => {
            const token = row.getValue('token') as string;
            const tokenImage = getTokenImage(token);
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
                    <span className="font-medium">{token}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'txStatus',
        header: 'Tx. Status',
        cell: ({row}) => {
            const status = row.getValue('txStatus') as string;
            return (
                <Badge variant={getStatusColor(status)}>
                    {status}
                </Badge>
            );
        },
    },
];

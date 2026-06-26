import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: string
  icon: LucideIcon
  gradient: string
  textColors: string
  iconColor: string
}

export function SummaryCard({ title, value, icon: Icon, gradient, textColors, iconColor }: SummaryCardProps) {
  return (
    <Card className={`${gradient} border-opacity-50 h-auto min-h-[60px] w-full max-w-[180px]`}>
      <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
        <CardTitle className={`text-[11px] font-medium leading-none ${textColors}`}>{title}</CardTitle>
        <Icon className={`h-3 w-3 ${iconColor}`} />
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className={`text-sm font-bold leading-none text-right tabular-nums ${textColors.replace("800", "900").replace("200", "100")}`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
